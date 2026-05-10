/**
 * confirmation-pending 画面の振る舞いテスト。HTTP 層は MSW で intercept。
 */
import { fireEvent } from "@testing-library/react-native";
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
  return buildExpoRouterMock({
    searchParams: { email: "pending@example.com" },
  });
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

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

const renderConfirmationPending = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Screen = require("../confirmation-pending").default;
  return renderWithProviders(<Screen />);
};

describe("confirmation-pending: 確認メール再送信", () => {
  it("再送ボタンタップで /auth/confirmation が呼ばれ、成功メッセージを表示する", async () => {
    let receivedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(apiUrl("/auth/confirmation"), async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ status: "success" });
      }),
    );

    const { getByText, findByText } = renderConfirmationPending();

    fireEvent.press(getByText("確認メールを再送信"));

    await findByText("確認メールを再送信しました");
    expect(receivedBody).toEqual({
      email: "pending@example.com",
      redirect_url: expect.any(String),
    });
  });

  it("再送が失敗した場合はエラー文言を表示する", async () => {
    server.use(
      http.post(apiUrl("/auth/confirmation"), () =>
        HttpResponse.json({ error: "server" }, { status: 500 }),
      ),
    );

    const { getByText, findByText, queryByText } = renderConfirmationPending();

    fireEvent.press(getByText("確認メールを再送信"));

    await findByText("確認メールの再送信に失敗しました");
    expect(queryByText("確認メールを再送信しました")).toBeNull();
  });
});
