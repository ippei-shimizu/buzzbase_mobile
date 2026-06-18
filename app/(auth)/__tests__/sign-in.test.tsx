/**
 * sign-in 画面の振る舞いテスト。
 *
 * 方針:
 * - サービス関数（signIn / googleSignIn 等）を jest.mock せず、HTTP 層を MSW で intercept する。
 * - 環境境界（Native Module・expo-router）のみ jest.mock する。
 * - 公開 UI（placeholder, Button label）から操作し、router の遷移発火を assert する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { useAuthStore } from "@stores/authStore";
import {
  apiUrl,
  authSuccessHeaders,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";

// jest.mock の factory は外部スコープを参照できないため、factory 内で require する。
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// Native Module のモック（テスト環境では Expo Go 扱いを回避し、signIn が呼ばれた時の動作を制御）
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { appOwnership: "standalone" },
}));

jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: "apple-id-token",
    fullName: { givenName: "Taro", familyName: "Test" },
  }),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  // AppleSignInButton コンポーネントが参照する定数群
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: { SIGN_IN: 0, CONTINUE: 1, SIGN_UP: 2 },
  AppleAuthenticationButtonStyle: { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest
      .fn()
      .mockResolvedValue({ data: { idToken: "google-id-token" } }),
  },
}));

// jest.mock の factory 内で生成された routerSpies を取り出す
const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouterMock = require("expo-router") as {
    __routerSpies: RouterSpies;
  };
  return expoRouterMock.__routerSpies;
};

beforeEach(() => {
  // jest.clearAllMocks は jest.fn() で生成された全モック（routerSpies を含む）を
  // 一括でクリアする。
  jest.clearAllMocks();
  // useAuthStore はグローバルストアなのでテスト毎に初期化
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

const renderSignIn = () => {
  // sign-in 画面は require 後に default export を取得（jest.mock 後に require する）
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SignInScreen = require("../sign-in").default;
  return renderWithProviders(<SignInScreen />);
};

describe("sign-in: メール/パスワード ログイン", () => {
  it("正しい入力で /auth/sign_in が呼ばれ、user_id 設定済みなら (tabs) へ遷移する", async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(apiUrl("/auth/sign_in"), async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(
          { data: { id: 1, email: "test@example.com", name: "tester" } },
          { headers: authSuccessHeaders() },
        );
      }),
      http.get(apiUrl("/user"), () =>
        HttpResponse.json({
          id: 1,
          email: "test@example.com",
          name: "tester",
          user_id: "tester",
        }),
      ),
    );

    const { getByPlaceholderText, getByText } = renderSignIn();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "test@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "password123",
    );
    fireEvent.press(getByText("ログイン"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(receivedBody).toEqual({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("メールログイン成功 + user_id 未設定 (null) で username-registration へ遷移する", async () => {
    server.use(
      http.post(apiUrl("/auth/sign_in"), () =>
        HttpResponse.json(
          { data: { id: 1, email: "noslug@example.com", name: "noslug" } },
          { headers: authSuccessHeaders() },
        ),
      ),
      http.get(apiUrl("/user"), () =>
        HttpResponse.json({
          id: 1,
          email: "noslug@example.com",
          name: "noslug",
          user_id: null,
        }),
      ),
    );

    const { getByPlaceholderText, getByText } = renderSignIn();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "noslug@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "password123",
    );
    fireEvent.press(getByText("ログイン"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.replace).toHaveBeenCalledWith(
        "/(auth)/username-registration",
      );
    });
  });

  it("401 + confirmation エラー時は confirmation-pending へ遷移する", async () => {
    server.use(
      http.post(apiUrl("/auth/sign_in"), () =>
        HttpResponse.json(
          { errors: ["A confirmation email has been sent to your account"] },
          { status: 401 },
        ),
      ),
    );

    const { getByPlaceholderText, getByText } = renderSignIn();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "pending@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "password123",
    );
    fireEvent.press(getByText("ログイン"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.push).toHaveBeenCalledWith({
        pathname: "/(auth)/confirmation-pending",
        params: { email: "pending@example.com" },
      });
    });
    expect(routerSpies.replace).not.toHaveBeenCalled();
  });

  it("401（confirmation でない）時はエラー文言を表示する", async () => {
    server.use(
      http.post(apiUrl("/auth/sign_in"), () =>
        HttpResponse.json(
          { errors: ["Invalid login credentials"] },
          { status: 401 },
        ),
      ),
    );

    const { getByPlaceholderText, getByText, findByText } = renderSignIn();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "wrong@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "wrongpass",
    );
    fireEvent.press(getByText("ログイン"));

    await findByText("メールアドレスまたはパスワードが正しくありません");
    const routerSpies = getRouterSpies();
    expect(routerSpies.replace).not.toHaveBeenCalled();
  });
});

describe("sign-in: Google ログイン", () => {
  it("Google サインイン成功 + requires_username=true で username-registration へ遷移", async () => {
    server.use(
      http.post(apiUrl("/google_sign_in"), () =>
        HttpResponse.json(
          {
            data: { id: 2, email: "g@example.com" },
            requires_username: true,
          },
          { headers: authSuccessHeaders() },
        ),
      ),
    );

    const { getByText } = renderSignIn();

    fireEvent.press(getByText("Googleでログイン"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.replace).toHaveBeenCalledWith(
        "/(auth)/username-registration",
      );
    });
  });

  it("Google サインイン成功 + requires_username=false で (tabs) へ遷移", async () => {
    server.use(
      http.post(apiUrl("/google_sign_in"), () =>
        HttpResponse.json(
          {
            data: { id: 2, email: "g@example.com" },
            requires_username: false,
          },
          { headers: authSuccessHeaders() },
        ),
      ),
    );

    const { getByText } = renderSignIn();

    fireEvent.press(getByText("Googleでログイン"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });
});
