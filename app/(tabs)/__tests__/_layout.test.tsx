/**
 * タブレイアウトの玄関ガードの振る舞いテスト。
 *
 * 起動時に必ず通る (tabs)/_layout で、オンボーディング未完了なら認証状態に
 * 関わらずオンボーディングへ、完了済みなら従来の認証ガードへ振り分けることを検証する。
 */
import { act, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@stores/authStore";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  const base = buildExpoRouterMock();
  const redirectHrefs: string[] = [];
  return {
    ...base,
    __redirectHrefs: redirectHrefs,
    Redirect: ({ href }: { href: string }) => {
      redirectHrefs.push(href);
      return null;
    },
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRedirectHrefs = (): string[] => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouterMock = require("expo-router") as {
    __redirectHrefs: string[];
  };
  return expoRouterMock.__redirectHrefs;
};

const getItemAsyncMock = SecureStore.getItemAsync as jest.Mock;

const renderTabLayout = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const TabLayout = require("../_layout").default;
  return renderWithProviders(<TabLayout />);
};

beforeEach(() => {
  jest.clearAllMocks();
  getRedirectHrefs().length = 0;
});

describe("(tabs)/_layout 玄関ガード", () => {
  it("未ログインかつオンボーディング未完了ならオンボーディングへ振り分ける", async () => {
    getItemAsyncMock.mockResolvedValueOnce(null);
    useAuthStore.setState({ isLoggedIn: false, isLoading: false });

    renderTabLayout();

    await waitFor(() => {
      expect(getRedirectHrefs()).toContain("/(onboarding)/welcome");
    });
  });

  it("未ログインかつオンボーディング完了済みなら sign-in へ振り分ける", async () => {
    getItemAsyncMock.mockResolvedValueOnce("1");
    useAuthStore.setState({ isLoggedIn: false, isLoading: false });

    renderTabLayout();

    await waitFor(() => {
      expect(getRedirectHrefs()).toContain("/(auth)/sign-in");
    });
  });

  it("ログイン済みならオンボーディング未完了でも表示せずタブへ進む", async () => {
    getItemAsyncMock.mockResolvedValueOnce(null);
    useAuthStore.setState({ isLoggedIn: true, isLoading: false });

    renderTabLayout();

    // useOnboarding の非同期読み込みを flush してもなお Redirect されないことを保証する
    await act(async () => {});
    expect(getRedirectHrefs()).toHaveLength(0);
  });
});
