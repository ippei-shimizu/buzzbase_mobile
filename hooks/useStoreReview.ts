import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { useCallback } from "react";

const KEYS = {
  GAME_COUNT: "store_review_game_count",
  INSTALL_DATE: "store_review_install_date",
  LAST_SHOWN: "store_review_last_shown",
  SHOWN_COUNT: "store_review_shown_count",
  SHOWN_YEAR: "store_review_shown_year",
} as const;

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

async function recordPrePromptShown(): Promise<void> {
  const currentYear = new Date().getFullYear();
  const storedYear = await SecureStore.getItemAsync(KEYS.SHOWN_YEAR);
  const prevCount =
    parseInt((await SecureStore.getItemAsync(KEYS.SHOWN_COUNT)) ?? "0", 10) ||
    0;
  const baseCount = storedYear !== String(currentYear) ? 0 : prevCount;

  await SecureStore.setItemAsync(KEYS.LAST_SHOWN, new Date().toISOString());
  await SecureStore.setItemAsync(KEYS.SHOWN_COUNT, String(baseCount + 1));
  await SecureStore.setItemAsync(KEYS.SHOWN_YEAR, String(currentYear));
}

export const useStoreReview = () => {
  const initInstallDate = useCallback(async () => {
    const existing = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (existing) return;
    await SecureStore.setItemAsync(KEYS.INSTALL_DATE, new Date().toISOString());
  }, []);

  const checkAndShowPrePrompt = useCallback(async (): Promise<boolean> => {
    const currentCount = await SecureStore.getItemAsync(KEYS.GAME_COUNT);
    const newCount = (parseInt(currentCount ?? "0", 10) || 0) + 1;
    await SecureStore.setItemAsync(KEYS.GAME_COUNT, String(newCount));

    if (!MILESTONES.includes(newCount)) return false;

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

    await recordPrePromptShown();
    return true;
  }, []);

  const requestNativeReview = useCallback(async () => {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;
    await StoreReview.requestReview();
  }, []);

  return { initInstallDate, checkAndShowPrePrompt, requestNativeReview };
};
