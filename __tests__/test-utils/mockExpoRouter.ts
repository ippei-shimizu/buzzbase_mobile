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

export interface ExpoRouterMockOptions {
  routerSpies?: RouterSpies;
  searchParams?: Record<string, string | string[]>;
}

export const buildExpoRouterMock = (options: ExpoRouterMockOptions = {}) => {
  const routerSpies = options.routerSpies ?? createRouterSpies();
  const searchParams = options.searchParams ?? {};

  return {
    __routerSpies: routerSpies,
    useRouter: () => routerSpies,
    useLocalSearchParams: () => searchParams,
    useSegments: () => [] as string[],
    usePathname: () => "/",
    useFocusEffect: (cb: () => (() => void) | void) => cb(),
    Link: ({ children }: { children: React.ReactNode }) => children,
    Redirect: () => null,
    Stack: Object.assign(
      ({ children }: { children?: React.ReactNode }) => children,
      { Screen: ({ children }: { children?: React.ReactNode }) => children },
    ),
    Tabs: Object.assign(
      ({ children }: { children?: React.ReactNode }) => children,
      { Screen: ({ children }: { children?: React.ReactNode }) => children },
    ),
    router: routerSpies,
  };
};
