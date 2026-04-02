import { useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";

const KEYS = {
  GAME_COUNT: "store_review_game_count",
  INSTALL_DATE: "store_review_install_date",
  LAST_SHOWN: "store_review_last_shown",
  SHOWN_COUNT: "store_review_shown_count",
  SHOWN_YEAR: "store_review_shown_year",
} as const;

const MILESTONES = [5, 20, 50, 80, 100];
const MIN_DAYS_SINCE_INSTALL = 7;
const MAX_SHOWS_PER_YEAR = 3;
const MIN_DAYS_BETWEEN_SHOWS = 90;

function daysSince(dateString: string | null): number {
  if (!dateString) return Infinity;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export const useStoreReview = () => {
  const initInstallDate = useCallback(async () => {
    const existing = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (existing) return;
    await SecureStore.setItemAsync(KEYS.INSTALL_DATE, new Date().toISOString());
  }, []);

  const checkAndRequestReview = useCallback(async () => {
    // 1. game_count をインクリメント
    const currentCount = await SecureStore.getItemAsync(KEYS.GAME_COUNT);
    const newCount = (parseInt(currentCount ?? "0", 10) || 0) + 1;
    await SecureStore.setItemAsync(KEYS.GAME_COUNT, String(newCount));

    // 2. マイルストーンに一致するか
    if (!MILESTONES.includes(newCount)) return;

    // 3. インストールから7日以上経過しているか
    const installDate = await SecureStore.getItemAsync(KEYS.INSTALL_DATE);
    if (!installDate || daysSince(installDate) < MIN_DAYS_SINCE_INSTALL) return;

    // 4. 年の表示回数をチェック（年が変わっていたらリセット）
    const currentYear = new Date().getFullYear();
    const storedYear = await SecureStore.getItemAsync(KEYS.SHOWN_YEAR);
    let shownCount =
      parseInt((await SecureStore.getItemAsync(KEYS.SHOWN_COUNT)) ?? "0", 10) ||
      0;

    if (storedYear !== String(currentYear)) {
      shownCount = 0;
    }

    if (shownCount >= MAX_SHOWS_PER_YEAR) return;

    // 5. 前回表示から90日以上経過しているか（初回はスキップ）
    const lastShown = await SecureStore.getItemAsync(KEYS.LAST_SHOWN);
    if (lastShown && daysSince(lastShown) < MIN_DAYS_BETWEEN_SHOWS) return;

    // 6. 端末が対応しているか
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    // 7. レビューダイアログを表示
    await StoreReview.requestReview();

    // 8. 表示状態を更新
    await SecureStore.setItemAsync(KEYS.LAST_SHOWN, new Date().toISOString());
    await SecureStore.setItemAsync(KEYS.SHOWN_COUNT, String(shownCount + 1));
    await SecureStore.setItemAsync(KEYS.SHOWN_YEAR, String(currentYear));
  }, []);

  return { initInstallDate, checkAndRequestReview };
};
