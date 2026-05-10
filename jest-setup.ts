// @testing-library/react-native v12.4+ には matcher が内蔵されているので import 不要
// 必要なグローバルモック（個別テストファイルからjest.mock(...)上書き可能）

// expo-secure-store: トークン保存系。テストではno-op
jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: 2,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 3,
  WHEN_UNLOCKED: 0,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
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

// react-native-safe-area-context: テストでは固定の inset を返す。
// 実環境では Expo Router がプロバイダを供給するが、テストでは直接フックを使えるようにする。
jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    SafeAreaView: ({ children, ...rest }: { children: React.ReactNode }) =>
      React.createElement(View, rest, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  };
});

// @react-native-community/datetimepicker: テスト時は通常の View に差し替え、
// onChange は __triggerDateChange グローバルから呼べるようにしておく。
jest.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: (props: { onChange?: (e: unknown, d: Date) => void }) =>
      React.createElement(View, {
        accessibilityLabel: "mock-datetimepicker",
        ...props,
      }),
  };
});
