/**
 * expo-router のモックヘルパー。
 *
 * jest.mock("expo-router", () => mockExpoRouter()) として使う。
 * 戻り値の `routerSpies` から push / replace / back の jest.fn を取り出して
 * 「画面遷移が発火したか」を検証できる。
 *
 * 参考: 画面コンポーネントは expo-router の `useRouter` / `useLocalSearchParams`
 * を直接呼ぶ。これらはテスト時にネイティブ依存を含むため、モジュール全体を
 * モックする必要がある。
 */
import { createElement, Fragment } from "react";

export interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  navigate: jest.Mock;
  dismiss: jest.Mock;
  dismissAll: jest.Mock;
  canDismiss: jest.Mock;
}

export const createRouterSpies = (): RouterSpies => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  // 既定で「畳めるスタックあり」を返す。テスト側で mockReturnValue で上書き可能。
  canDismiss: jest.fn(() => true),
});

export interface NavigationSpies {
  setOptions: jest.Mock;
  dispatch: jest.Mock;
  addListener: jest.Mock;
  /** 登録済みリスナーを発火させ、スワイプ／物理戻るなどの離脱を再現する。 */
  emit: (type: string, event: unknown) => void;
}

export const createNavigationSpies = (): NavigationSpies => {
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  return {
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    addListener: jest.fn((type: string, listener: (event: unknown) => void) => {
      const registered = listeners.get(type) ?? new Set();
      registered.add(listener);
      listeners.set(type, registered);
      return () => registered.delete(listener);
    }),
    emit: (type, event) => {
      listeners.get(type)?.forEach((listener) => listener(event));
    },
  };
};

export interface ExpoRouterMockOptions {
  routerSpies?: RouterSpies;
  navigationSpies?: NavigationSpies;
  searchParams?: Record<string, string | string[]>;
  /** Stack.Screen の headerLeft / headerRight も描画する。既定は無効。 */
  renderScreenOptions?: boolean;
  /** useSegments() の初期値。テスト中に __setSegments で差し替えられる。 */
  segments?: string[];
}

interface ScreenProps {
  children?: React.ReactNode;
  options?: {
    headerLeft?: () => React.ReactNode;
    headerRight?: () => React.ReactNode;
  };
}

const ScreenPassthrough = ({ children }: ScreenProps) => children ?? null;

/**
 * headerLeft / headerRight も描画する Stack.Screen。
 * ヘッダー内のボタン（編集・削除など）を検証したいテストでのみ有効化する。
 */
const ScreenWithHeader = ({ children, options }: ScreenProps) =>
  createElement(
    Fragment,
    null,
    options?.headerLeft?.(),
    options?.headerRight?.(),
    children,
  );

export const buildExpoRouterMock = (options: ExpoRouterMockOptions = {}) => {
  const renderScreenOptions = options.renderScreenOptions ?? false;
  const routerSpies = options.routerSpies ?? createRouterSpies();
  const navigationSpies = options.navigationSpies ?? createNavigationSpies();
  const searchParams = options.searchParams ?? {};
  // <Redirect> は router.push 等を呼ばない宣言的コンポーネントのため、
  // 遷移先 href を記録するスパイを別途用意して「リダイレクトが発火したか」を検証可能にする。
  const redirectSpy = jest.fn();
  let segments = options.segments ?? [];

  return {
    __routerSpies: routerSpies,
    __setSegments: (next: string[]) => {
      segments = next;
    },
    __navigationSpies: navigationSpies,
    __redirectSpy: redirectSpy,
    useRouter: () => routerSpies,
    useLocalSearchParams: () => searchParams,
    useSegments: () => segments,
    usePathname: () => "/",
    useFocusEffect: (cb: () => (() => void) | void) => cb(),
    // headerLeft 等の Stack スクリーン options 上書きと、
    // beforeRemove など画面離脱イベントの購読に使う。
    useNavigation: () => navigationSpies,
    Link: ({ children }: { children: React.ReactNode }) => children,
    Redirect: ({ href }: { href: string }) => {
      redirectSpy(href);
      return null;
    },
    Stack: Object.assign(
      ({ children }: { children?: React.ReactNode }) => children ?? null,
      { Screen: renderScreenOptions ? ScreenWithHeader : ScreenPassthrough },
    ),
    Tabs: Object.assign(
      ({ children }: { children?: React.ReactNode }) => children ?? null,
      {
        Screen: ({ children }: { children?: React.ReactNode }) =>
          children ?? null,
      },
    ),
    router: routerSpies,
  };
};
