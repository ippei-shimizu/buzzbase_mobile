import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { useCallback } from "react";
import { Linking, Platform } from "react-native";
import { ANDROID_STORE_URL, IOS_REVIEW_URL } from "@constants/appStore";

const KEYS = {
  POSITIVE_EVENT_COUNT: "store_review_positive_event_count",
  INSTALL_DATE: "store_review_install_date",
  LAST_SHOWN: "store_review_last_shown",
  SHOWN_AT_LIST: "store_review_shown_at_list",
  CONSUMED_MILESTONE: "store_review_consumed_milestone",
} as const;

const LEGACY_GAME_COUNT_KEY = "store_review_game_count";
const LEGACY_SHOWN_COUNT_KEY = "store_review_shown_count";
const LEGACY_SHOWN_YEAR_KEY = "store_review_shown_year";

const MILESTONES = [2, 5, 20, 50, 100];
const MIN_DAYS_SINCE_INSTALL = 7;
// Apple の上限「365日で3回」に窓を揃える。暦年で数えると年末と年明けで最大6回になる。
const MAX_SHOWS_PER_365_DAYS = 3;
const MIN_DAYS_BETWEEN_SHOWS = 60;

function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

async function readInt(key: string): Promise<number> {
  return parseInt((await SecureStore.getItemAsync(key)) ?? "0", 10) || 0;
}

/**
 * 到達済みで未消化のマイルストーンのうち最大のものを返す。無ければ null。
 * 一度に複数を跨いだ場合もまとめて消化し、同じ到達で連続発火させない。
 */
function findReachedMilestone(
  count: number,
  consumedMilestone: number,
): number | null {
  const reached = MILESTONES.filter(
    (milestone) => milestone > consumedMilestone && milestone <= count,
  );
  return reached.length > 0 ? reached[reached.length - 1] : null;
}

function parseShownAtList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/** 直近365日以内にレビューを要求した日時（ISO 文字列）の一覧を返す。 */
async function readRecentShownAtList(): Promise<string[]> {
  const stored = await SecureStore.getItemAsync(KEYS.SHOWN_AT_LIST);
  const shownAtList =
    stored !== null ? parseShownAtList(stored) : await readLegacyShownAtList();
  return shownAtList.filter((shownAt) => daysSince(shownAt) < 365);
}

// 暦年カウント時代の端末は日時の一覧を持たないため、当年の回数ぶんを最終表示日で近似する。
async function readLegacyShownAtList(): Promise<string[]> {
  const lastShown = await SecureStore.getItemAsync(KEYS.LAST_SHOWN);
  const shownYear = await SecureStore.getItemAsync(LEGACY_SHOWN_YEAR_KEY);
  if (!lastShown || shownYear !== String(new Date().getFullYear())) return [];
  const shownCount = await readInt(LEGACY_SHOWN_COUNT_KEY);
  return Array.from({ length: shownCount }, () => lastShown);
}

async function recordReviewRequested(
  recentShownAtList: string[],
  milestone: number,
): Promise<void> {
  const now = new Date().toISOString();
  // 途中で失敗しても、同じマイルストーンで再要求しないよう消化を先に書く。
  await SecureStore.setItemAsync(KEYS.CONSUMED_MILESTONE, String(milestone));
  await SecureStore.setItemAsync(KEYS.LAST_SHOWN, now);
  await SecureStore.setItemAsync(
    KEYS.SHOWN_AT_LIST,
    JSON.stringify([...recentShownAtList, now]),
  );
}

export const useStoreReview = () => {
  const initInstallDate = useCallback(async () => {
    const existing = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (existing) return;
    await SecureStore.setItemAsync(KEYS.INSTALL_DATE, new Date().toISOString());
  }, []);

  const initPositiveEventCount = useCallback(async () => {
    const existing = await SecureStore.getItemAsync(KEYS.POSITIVE_EVENT_COUNT);
    if (existing !== null) return;
    const legacy = await SecureStore.getItemAsync(LEGACY_GAME_COUNT_KEY);
    await SecureStore.setItemAsync(KEYS.POSITIVE_EVENT_COUNT, legacy ?? "0");
  }, []);

  const incrementPositiveEvent = useCallback(async (): Promise<number> => {
    const current = await SecureStore.getItemAsync(KEYS.POSITIVE_EVENT_COUNT);
    const next = (parseInt(current ?? "0", 10) || 0) + 1;
    await SecureStore.setItemAsync(KEYS.POSITIVE_EVENT_COUNT, String(next));
    return next;
  }, []);

  /**
   * 未消化のマイルストーンに到達していて頻度ゲートを満たすとき、OS のレビューダイアログを要求する。
   * @return `requestReview()` を呼んだら true。OS が実際に表示したかは API から取得できない
   */
  const requestReviewIfEligible = useCallback(async (): Promise<boolean> => {
    const count = await readInt(KEYS.POSITIVE_EVENT_COUNT);
    const consumedMilestone = await readInt(KEYS.CONSUMED_MILESTONE);
    const milestone = findReachedMilestone(count, consumedMilestone);
    if (milestone === null) return false;

    const installDate = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (!installDate || daysSince(installDate) < MIN_DAYS_SINCE_INSTALL) {
      return false;
    }

    const recentShownAtList = await readRecentShownAtList();
    if (recentShownAtList.length >= MAX_SHOWS_PER_365_DAYS) return false;

    const lastShown = await SecureStore.getItemAsync(KEYS.LAST_SHOWN);
    if (lastShown && daysSince(lastShown) < MIN_DAYS_BETWEEN_SHOWS) {
      return false;
    }

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    await StoreReview.requestReview();
    try {
      await recordReviewRequested(recentShownAtList, milestone);
    } catch (error) {
      // 要求自体は成功しているため true を返し、広告との二重割り込みを避ける。
      Sentry.captureException(error, {
        tags: { feature: "store-review" },
        extra: { milestone },
      });
    }
    return true;
  }, []);

  /**
   * 設定画面の「レビューで応援する」から呼ばれる、ストアのレビュー画面への明示遷移。
   *
   * iOS: App Storeのレビュー書き込み画面（`?action=write-review`）を直接開く。
   * Android: Play Storeのアプリページを開く（書き込み画面への直接スキームは存在しない）。
   *
   * `Linking.canOpenURL` で開けない場合は何もしない（Sentryで観測のみ）。
   * Simulatorでは `itms-apps://` が解決されないことがあるため、このパスはサイレントフェイルする想定。
   */
  const openStoreReviewPage = useCallback(async () => {
    const url =
      Platform.OS === "ios"
        ? `${IOS_REVIEW_URL}?action=write-review`
        : ANDROID_STORE_URL;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Sentry.captureMessage("Store review URL cannot be opened", {
          level: "warning",
          extra: { url, platform: Platform.OS },
        });
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "store-review" },
        extra: { url, platform: Platform.OS },
      });
    }
  }, []);

  return {
    initInstallDate,
    initPositiveEventCount,
    incrementPositiveEvent,
    requestReviewIfEligible,
    openStoreReviewPage,
  };
};
