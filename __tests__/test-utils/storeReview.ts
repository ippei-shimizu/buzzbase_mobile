/**
 * SecureStore をメモリ上の Map に差し替え、次のポジティブイベントで
 * ストアレビューを要求できる状態（インストールから30日・イベント1件済み）にする。
 * OS のダイアログは各テストで `jest.mock("expo-store-review", ...)` して観測する。
 *
 * @return テストから追加の値を書き込むための Map
 */
export const seedEligibleStoreReview = (): Map<string, string> => {
  const storage = new Map<string, string>([
    ["store_review_positive_event_count", "1"],
    [
      "store_review_install_date",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ],
  ]);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const secureStore = require("expo-secure-store") as {
    getItemAsync: jest.Mock;
    setItemAsync: jest.Mock;
  };
  secureStore.getItemAsync.mockImplementation(
    async (key: string) => storage.get(key) ?? null,
  );
  secureStore.setItemAsync.mockImplementation(
    async (key: string, value: string) => {
      storage.set(key, value);
    },
  );
  return storage;
};
