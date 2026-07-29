import * as SecureStore from "expo-secure-store";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { INTERSTITIAL_AD_UNIT_ID } from "@constants/admob";

const KEYS = {
  INSTALL_DATE: "admob_install_date",
  LAUNCH_COUNT: "admob_launch_count",
  LAST_SHOWN_DATE: "admob_interstitial_last_shown_date",
  SHOWN_COUNT_TODAY: "admob_interstitial_shown_count_today",
} as const;

// 初回起動後しばらくは広告を出さず、初回体験の質を守る猶予期間。
const GRACE_PERIOD_DAYS = 7;
const GRACE_PERIOD_LAUNCH_COUNT = 5;
const DAILY_LIMIT = 1;

const todayString = (): string => new Date().toISOString().slice(0, 10);

const daysSince = (dateString: string | null): number => {
  if (!dateString) return Infinity;
  const elapsedMs = Date.now() - new Date(dateString).getTime();
  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
};

/**
 * インストール日の記録と起動回数のカウントアップ。app/_layout.tsxから
 * アプリ起動のたびに1回だけ呼ぶ。
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

const recordShown = async (): Promise<void> => {
  const count = await todayShownCount();
  await SecureStore.setItemAsync(KEYS.LAST_SHOWN_DATE, todayString());
  await SecureStore.setItemAsync(KEYS.SHOWN_COUNT_TODAY, String(count + 1));
};

/**
 * 試合記録の保存完了直後に呼ぶインタースティシャル広告。
 * 1日1回上限・初回起動後の猶予期間・Pro加入者(no_ads entitlement)は表示しない。
 */
export const showMatchSaveInterstitial = async (
  hasNoAdsEntitlement: boolean,
): Promise<void> => {
  if (hasNoAdsEntitlement || !INTERSTITIAL_AD_UNIT_ID) return;
  if (await isWithinGracePeriod()) return;
  if ((await todayShownCount()) >= DAILY_LIMIT) return;

  const interstitial = InterstitialAd.createForAdRequest(
    INTERSTITIAL_AD_UNIT_ID,
  );

  await new Promise<void>((resolve) => {
    const unsubscribers: (() => void)[] = [];
    const cleanup = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };

    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
      }),
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
        recordShown().finally(resolve);
      }),
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        cleanup();
        resolve();
      }),
    );

    interstitial.load();
  });
};
