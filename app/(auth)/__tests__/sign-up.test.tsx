/**
 * sign-up 画面の振る舞いテスト。HTTP 層は MSW で intercept。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { useAuthStore } from "@stores/authStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { appOwnership: "standalone" },
}));

jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: { SIGN_IN: 0, CONTINUE: 1, SIGN_UP: 2 },
  AppleAuthenticationButtonStyle: { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
  },
}));

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
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

const renderSignUp = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SignUpScreen = require("../sign-up").default;
  return renderWithProviders(<SignUpScreen />);
};

describe("sign-up", () => {
  it("正しい入力で /auth が呼ばれ、confirmation-pending へ push する", async () => {
    let receivedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(apiUrl("/auth"), async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ status: "success" });
      }),
    );

    const { getByPlaceholderText, getByText } = renderSignUp();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "new@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "password123",
    );
    fireEvent.changeText(
      getByPlaceholderText("パスワードを再入力"),
      "password123",
    );
    fireEvent.press(getByText("アカウント登録"));

    const routerSpies = getRouterSpies();
    await waitFor(() => {
      expect(routerSpies.push).toHaveBeenCalledWith({
        pathname: "/(auth)/confirmation-pending",
        params: { email: "new@example.com" },
      });
    });
    expect(receivedBody).toEqual({
      email: "new@example.com",
      password: "password123",
      password_confirmation: "password123",
      confirm_success_url: expect.any(String),
    });
  });

  it("422 + Email has already been taken でメール重複エラー文言を表示する", async () => {
    server.use(
      http.post(apiUrl("/auth"), () =>
        HttpResponse.json(
          {
            errors: { full_messages: ["Email has already been taken"] },
          },
          { status: 422 },
        ),
      ),
    );

    const { getByPlaceholderText, getByText, findByText } = renderSignUp();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "duplicated@example.com",
    );
    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "password123",
    );
    fireEvent.changeText(
      getByPlaceholderText("パスワードを再入力"),
      "password123",
    );
    fireEvent.press(getByText("アカウント登録"));

    await findByText("このメールアドレスは既に登録されています");
    const routerSpies = getRouterSpies();
    expect(routerSpies.push).not.toHaveBeenCalled();
  });
});
