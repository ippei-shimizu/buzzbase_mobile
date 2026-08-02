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

// react-native-purchases: テストでは no-op。
// 10.x 系は ESM 依存（@revenuecat/purchases-js-hybrid-mappings 等）を持ち込み、
// Jest が transform できず他テスト（_layout 経由する画面テスト）も連鎖失敗するため、
// グローバルにモックして HTTP / ネイティブ呼び出しを完全に遮断する。
// 個別テストは jest.mock(..., factory) で上書き可能。
jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    logIn: jest.fn().mockResolvedValue(undefined),
    logOut: jest.fn().mockResolvedValue(undefined),
    getOfferings: jest.fn().mockResolvedValue({ current: null }),
    getCustomerInfo: jest
      .fn()
      .mockResolvedValue({ entitlements: { active: {} } }),
    purchasePackage: jest
      .fn()
      .mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    restorePurchases: jest
      .fn()
      .mockResolvedValue({ entitlements: { active: {} } }),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  },
  // 実パッケージの enum 値（文字列の数値コード）に合わせる。
  // エラーコード分岐（PaywallModal / pro 画面）のテストで参照する。
  PURCHASES_ERROR_CODE: {
    PRODUCT_ALREADY_PURCHASED_ERROR: "6",
    PAYMENT_PENDING_ERROR: "20",
  },
}));

// @sentry/react-native: テストでは no-op
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  wrap: (component: unknown) => component,
}));

// posthog-react-native: ネイティブ依存を含むため import を成立させる。
// utils/posthog は __DEV__===true でシングルトンが null になるが、_layout が
// PostHogProvider を import するため Provider をパススルーで差し替える。
jest.mock("posthog-react-native", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    identify: jest.fn(),
    capture: jest.fn(),
    screen: jest.fn(),
    reset: jest.fn(),
  })),
  PostHogProvider: ({ children }: { children: unknown }) => children,
  usePostHog: () => ({
    identify: jest.fn(),
    capture: jest.fn(),
    screen: jest.fn(),
    reset: jest.fn(),
  }),
}));

// react-native-reanimated: 公式 mock (`react-native-reanimated/mock`) は内部で
// react-native-worklets の native init を要求して `WorkletsError` で失敗するため、
// 必要な API だけ手動で no-op としてモックする。アニメーションはテストでは
// 視覚的に検証しないため、worklet 起動を完全に避ける。
jest.mock("react-native-reanimated", () => {
  const passThrough = <T>(value: T) => value;
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: <T>(component: T) => component,
    },
    createAnimatedComponent: <T>(component: T) => component,
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedProps: () => ({}),
    useAnimatedStyle: () => ({}),
    useDerivedValue: (factory: () => unknown) => ({ value: factory() }),
    withTiming: passThrough,
    withSpring: passThrough,
    withRepeat: passThrough,
    withDelay: (_delay: number, animation: unknown) => animation,
    withSequence: (...args: unknown[]) => args[args.length - 1],
    cancelAnimation: () => undefined,
    runOnJS:
      <T extends (...args: never[]) => unknown>(fn: T) =>
      (...args: Parameters<T>) =>
        fn(...args),
    runOnUI:
      <T extends (...args: never[]) => unknown>(fn: T) =>
      (...args: Parameters<T>) =>
        fn(...args),
    Easing: {
      linear: () => 0,
      ease: () => 0,
      quad: () => 0,
      cubic: () => 0,
      out: () => () => 0,
      in: () => () => 0,
      inOut: () => () => 0,
      bezier: () => () => 0,
    },
  };
});

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

// expo-video: VideoPlayer/VideoView はネイティブの SharedObject を拡張するクラスで、
// jest環境ではネイティブバインディングが存在せずimport時に例外になるため手動でモックする。
jest.mock("expo-video", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  return {
    useVideoPlayer: (
      _source: unknown,
      setup?: (player: Record<string, unknown>) => void,
    ) => {
      const player = { play: jest.fn(), pause: jest.fn(), release: jest.fn() };
      setup?.(player);
      return player;
    },
    createVideoPlayer: () => ({
      play: jest.fn(),
      pause: jest.fn(),
      release: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    }),
    VideoView: (props: Record<string, unknown>) =>
      React.createElement(View, { accessibilityLabel: "mock-video-view" }),
  };
});

// expo-video-thumbnails: サムネイル生成はネイティブ処理のため固定のURIを返す。
jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn().mockResolvedValue({
    uri: "file:///mock-thumbnail.jpg",
    width: 100,
    height: 100,
  }),
}));

// react-native-compressor: 圧縮せず入力URIをそのまま返す。
jest.mock("react-native-compressor", () => ({
  Video: {
    compress: jest.fn((uri: string) => Promise.resolve(uri)),
  },
  Image: {
    compress: jest.fn((uri: string) => Promise.resolve(uri)),
  },
}));

// react-native-video-trim: showEditorはネイティブUIを開くだけで、テストでは
// イベント購読の型（EventSubscription）だけ満たせればよい。実際のイベント発火は
// 各テストファイルでjest.doMockして個別に検証する。
jest.mock("react-native-video-trim", () => ({
  __esModule: true,
  showEditor: jest.fn(),
  default: {
    onFinishTrimming: jest.fn(() => ({ remove: jest.fn() })),
    onCancel: jest.fn(() => ({ remove: jest.fn() })),
    onError: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// react-native-google-mobile-ads: バナーはダミーViewを描画し、
// インタースティシャルはイベント発火無しの静的モック（個別テストでjest.doMockして上書き可能）。
jest.mock("react-native-google-mobile-ads", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    BannerAd: (props: Record<string, unknown>) =>
      React.createElement(View, {
        ...props,
        accessibilityLabel: "mock-banner-ad",
      }),
    BannerAdSize: {
      BANNER: "BANNER",
      ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER",
      LARGE_ANCHORED_ADAPTIVE_BANNER: "LARGE_ANCHORED_ADAPTIVE_BANNER",
      MEDIUM_RECTANGLE: "MEDIUM_RECTANGLE",
    },
    TestIds: {
      BANNER: "test-banner-unit-id",
      INTERSTITIAL: "test-interstitial-unit-id",
    },
    AdEventType: { LOADED: "loaded", CLOSED: "closed", ERROR: "error" },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => ({
        addAdEventListener: jest.fn(() => jest.fn()),
        load: jest.fn(),
        show: jest.fn().mockResolvedValue(undefined),
      })),
    },
  };
});

// expo-tracking-transparency: ATTダイアログはネイティブUIのため、常に許可済みとして返す。
jest.mock("expo-tracking-transparency", () => ({
  requestTrackingPermissionsAsync: jest.fn().mockResolvedValue({
    status: "granted",
    granted: true,
    canAskAgain: false,
    expires: "never",
  }),
  getTrackingPermissionsAsync: jest.fn().mockResolvedValue({
    status: "granted",
    granted: true,
    canAskAgain: false,
    expires: "never",
  }),
}));
