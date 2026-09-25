import * as SecureStore from "expo-secure-store";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { interstitialAdUnitId } from "@constants/admob";

const KEYS = {
  INSTALL_DATE: "admob_install_date",
  LAUNCH_COUNT: "admob_launch_count",
  LAST_SHOWN_DATE: "admob_interstitial_last_shown_date",
  LAST_SHOWN_AT: "admob_interstitial_last_shown_at",
  SHOWN_COUNT_TODAY: "admob_interstitial_shown_count_today",
} as const;

// 初回起動後しばらくは広告を出さず、初回体験の質を守る猶予期間。
const GRACE_PERIOD_DAYS = 7;
const GRACE_PERIOD_LAUNCH_COUNT = 5;
const DAILY_LIMIT = 2;
// 大会日に複数試合を続けて入力すると数分以内に全画面広告が連続するため、
// 1日の上限とは別に表示間隔の下限を設ける。
const MIN_INTERVAL_MS = 15 * 60 * 1000;
// ロード/表示のいずれのイベントも発火しないケース(ネットワーク異常等)で
// 保存完了後の画面遷移が無期限にブロックされないためのフォールバック。
const LOAD_TIMEOUT_MS = 10_000;

// 「1日」はユーザーの体感に合わせて端末ローカルの暦日で数える。UTC日付だと
// JSTでは09:00に窓が切り替わり、朝から試合がある日に上限が実質2倍になる。
const todayString = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const daysSince = (dateString: string | null): number => {
  if (!dateString) return Infinity;
  const elapsedMs = Date.now() - new Date(dateString).getTime();
  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
};

/**
 * インストール日の記録と起動回数のカウントアップ。app/(tabs)/_layout.tsxの
 * ログイン確定時(isLoggedIn===true)に呼ぶ。ログアウト→再ログインを同一
 * セッション内で繰り返すとその都度カウントされる想定(厳密な起動回数ではない)。
 */
export const trackAppLaunchForAds = async (): Promise<void> => {
  const existing = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
  if (!existing) {
    await SecureStore.setItemAsync(KEYS.INSTALL_DATE, new Date().toISOString());
  }
  const count =
    parseInt((await SecureStore.getItemAsync(KEYS.LAUNCH_COUNT)) ?? "0", 10) ||
    0;
  await SecureStore.setItemAsync(KEYS.LAUNCH_COUNT, String(count + 1));
};

const isWithinGracePeriod = async (): Promise<boolean> => {
  const installDate = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
  const launchCount =
    parseInt((await SecureStore.getItemAsync(KEYS.LAUNCH_COUNT)) ?? "0", 10) ||
    0;
  return (
    daysSince(installDate) < GRACE_PERIOD_DAYS ||
    launchCount < GRACE_PERIOD_LAUNCH_COUNT
  );
};

const todayShownCount = async (): Promise<number> => {
  const lastShownDate = await SecureStore.getItemAsync(KEYS.LAST_SHOWN_DATE);
  if (lastShownDate !== todayString()) return 0;
  return (
    parseInt(
      (await SecureStore.getItemAsync(KEYS.SHOWN_COUNT_TODAY)) ?? "0",
      10,
    ) || 0
  );
};

const isWithinMinInterval = async (todayCount: number): Promise<boolean> => {
  const lastShownAt = await SecureStore.getItemAsync(KEYS.LAST_SHOWN_AT);
  // 表示時刻の記録を始める前に今日1回表示した端末は時刻を持たない。時刻が不明な
  // 間は間隔を守る側に倒す(次の表示で記録され、翌日以降は通常判定に戻る)。
  if (!lastShownAt) return todayCount > 0;
  const elapsedMs = Date.now() - new Date(lastShownAt).getTime();
  // 端末の時刻が巻き戻ると経過が負になる。記録を信用せず表示を許す(次の表示で復旧する)。
  return elapsedMs >= 0 && elapsedMs < MIN_INTERVAL_MS;
};

const recordShown = async (): Promise<void> => {
  const count = await todayShownCount();
  await SecureStore.setItemAsync(KEYS.LAST_SHOWN_DATE, todayString());
  await SecureStore.setItemAsync(KEYS.SHOWN_COUNT_TODAY, String(count + 1));
  await SecureStore.setItemAsync(KEYS.LAST_SHOWN_AT, new Date().toISOString());
};

/**
 * 試合記録の保存完了直後に呼ぶインタースティシャル広告。
 * 1日2回上限・前回表示から15分・初回起動後の猶予期間・Pro加入者
 * (no_ads entitlement)は表示しない。
 *
 * @param hasNoAdsEntitlement 広告非表示のentitlementを持つか
 * @param isEditMode 既存記録の編集保存か。入力ミスの修正に広告を当てないため表示しない
 */
export const showMatchSaveInterstitial = async (
  hasNoAdsEntitlement: boolean,
  isEditMode = false,
): Promise<void> => {
  if (isEditMode) return;
  // ユニットIDの取得はPro判定の後、表示条件の判定より前に行う。Pro加入者に未設定
  // 警告を出さないためにPro判定は先に置き、広告を配信しないAndroidで
  // SecureStore を何度も読むのを避けるため表示条件より前に置く。
  if (hasNoAdsEntitlement) return;
  const unitId = interstitialAdUnitId();
  if (!unitId) return;

  if (await isWithinGracePeriod()) return;
  const todayCount = await todayShownCount();
  if (todayCount >= DAILY_LIMIT) return;
  if (await isWithinMinInterval(todayCount)) return;

  const interstitial = InterstitialAd.createForAdRequest(unitId);

  await new Promise<void>((resolve) => {
    let settled = false;
    const unsubscribers: (() => void)[] = [];
    const cleanup = () => {
      clearTimeout(timeoutId);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
    const settleOnce = (afterResolve?: () => Promise<void>) => {
      if (settled) return;
      settled = true;
      cleanup();
      (afterResolve?.() ?? Promise.resolve()).finally(resolve);
    };

    const timeoutId = setTimeout(() => settleOnce(), LOAD_TIMEOUT_MS);

    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
      }),
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        settleOnce(recordShown);
      }),
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        settleOnce();
      }),
    );

    interstitial.load();
  });
};
