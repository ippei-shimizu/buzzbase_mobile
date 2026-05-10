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
  SHOWN_COUNT: "store_review_shown_count",
  SHOWN_YEAR: "store_review_shown_year",
} as const;

const LEGACY_GAME_COUNT_KEY = "store_review_game_count";

const MILESTONES = [2, 5, 20, 50, 100];
const MIN_DAYS_SINCE_INSTALL = 7;
const MAX_SHOWS_PER_YEAR = 3;
const MIN_DAYS_BETWEEN_SHOWS = 90;

function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

async function recordPrePromptShown(baseCount: number): Promise<void> {
  await SecureStore.setItemAsync(KEYS.LAST_SHOWN, new Date().toISOString());
  await SecureStore.setItemAsync(KEYS.SHOWN_COUNT, String(baseCount + 1));
  await SecureStore.setItemAsync(
    KEYS.SHOWN_YEAR,
    String(new Date().getFullYear()),
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

  const checkAndShowPrePrompt = useCallback(async (): Promise<boolean> => {
    const currentCount = await SecureStore.getItemAsync(
      KEYS.POSITIVE_EVENT_COUNT,
    );
    const count = parseInt(currentCount ?? "0", 10) || 0;

    if (!MILESTONES.includes(count)) return false;

    const installDate = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (!installDate || daysSince(installDate) < MIN_DAYS_SINCE_INSTALL) {
      return false;
    }

    const currentYear = new Date().getFullYear();
    const storedYear = await SecureStore.getItemAsync(KEYS.SHOWN_YEAR);
    let shownCount =
      parseInt((await SecureStore.getItemAsync(KEYS.SHOWN_COUNT)) ?? "0", 10) ||
      0;
    if (storedYear !== String(currentYear)) {
      shownCount = 0;
    }
    if (shownCount >= MAX_SHOWS_PER_YEAR) return false;

    const lastShown = await SecureStore.getItemAsync(KEYS.LAST_SHOWN);
    if (lastShown && daysSince(lastShown) < MIN_DAYS_BETWEEN_SHOWS) {
      return false;
    }

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    await recordPrePromptShown(shownCount);
    return true;
  }, []);

  const requestNativeReview = useCallback(async () => {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;
    await StoreReview.requestReview();
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
    checkAndShowPrePrompt,
    requestNativeReview,
    openStoreReviewPage,
  };
};
