// @testing-library/react-native v12.4+ には matcher が内蔵されているので import 不要
// 必要なグローバルモック（個別テストファイルからjest.mock(...)上書き可能）

// expo-secure-store: トークン保存系。テストではno-op
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// @sentry/react-native: テストでは no-op
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  wrap: (component: unknown) => component,
}));

// react-native-reanimated は jest-expo preset 経由で扱われるが、念のためモック
jest.mock("react-native-reanimated", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-reanimated/mock"),
);
