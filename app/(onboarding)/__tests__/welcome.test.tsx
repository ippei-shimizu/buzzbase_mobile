/**
 * オンボーディング welcome 画面の振る舞いテスト。
 *
 * 方針:
 * - 公開 UI（ボタンラベル / アクセシビリティラベル）から操作し、フラグ永続化と
 *   router の遷移発火を assert する。
 * - 横スクロールのページ送りは公開ボタン（次へ / 戻る）経由で検証し、内部 scroll
 *   イベントの合成には依存しない。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@stores/authStore";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouterMock = require("expo-router") as {
    __routerSpies: RouterSpies;
  };
  return expoRouterMock.__routerSpies;
};

const setItemAsyncMock = SecureStore.setItemAsync as jest.Mock;

const renderWelcome = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WelcomeScreen = require("../welcome").default;
  return renderWithProviders(<WelcomeScreen />);
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

describe("onboarding welcome", () => {
  it("初期表示は Step1 で、次へボタンと進捗インジケーターを表示する", () => {
    const { getByText, queryByText, queryByLabelText, getByRole } =
      renderWelcome();

    expect(getByText("打者も投手も、入力するだけで自動計算")).toBeTruthy();
    expect(getByText("次へ")).toBeTruthy();
    expect(queryByText("はじめる")).toBeNull();
    expect(queryByLabelText("前のステップに戻る")).toBeNull();
    expect(getByRole("progressbar")).toBeTruthy();
  });

  it("次へを進めると最終ステップで「はじめる」が表示される", () => {
    const { getByText, queryByText } = renderWelcome();

    fireEvent.press(getByText("次へ"));
    fireEvent.press(getByText("次へ"));

    expect(getByText("はじめる")).toBeTruthy();
    expect(queryByText("次へ")).toBeNull();
  });

  it("次へで戻る矢印が現れ、押すと最初のステップに戻る", () => {
    const { getByText, getByLabelText, queryByLabelText } = renderWelcome();

    fireEvent.press(getByText("次へ"));
    expect(getByLabelText("前のステップに戻る")).toBeTruthy();

    fireEvent.press(getByLabelText("前のステップに戻る"));
    expect(queryByLabelText("前のステップに戻る")).toBeNull();
  });

  it("未ログイン時はスキップでフラグを立て sign-up へ遷移する", async () => {
    const { getByText } = renderWelcome();

    fireEvent.press(getByText("スキップ"));

    await waitFor(() => {
      expect(setItemAsyncMock).toHaveBeenCalledWith(
        "onboarding_completed",
        "1",
      );
    });
    expect(getRouterSpies().replace).toHaveBeenCalledWith("/(auth)/sign-up");
  });

  it("ログイン済み時はスキップで (tabs) へ遷移する", async () => {
    useAuthStore.setState({ isLoggedIn: true, isLoading: false });
    const { getByText } = renderWelcome();

    fireEvent.press(getByText("スキップ"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("最終ステップの「はじめる」でフラグを立て sign-up へ遷移する", async () => {
    const { getByText } = renderWelcome();

    fireEvent.press(getByText("次へ"));
    fireEvent.press(getByText("次へ"));
    fireEvent.press(getByText("はじめる"));

    await waitFor(() => {
      expect(setItemAsyncMock).toHaveBeenCalledWith(
        "onboarding_completed",
        "1",
      );
    });
    expect(getRouterSpies().replace).toHaveBeenCalledWith("/(auth)/sign-up");
  });
});
