/**
 * forgot-password 画面の振る舞いテスト。HTTP 層は MSW で intercept。
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
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

const renderForgotPassword = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Screen = require("../forgot-password").default;
  return renderWithProviders(<Screen />);
};

const GENERIC_MESSAGE =
  "ご入力いただいたメールアドレス宛にパスワード再設定のご案内をお送りしました（該当するアカウントが存在する場合）。メールをご確認ください。";

describe("forgot-password: パスワードリセット申請", () => {
  it("送信すると /auth/password が呼ばれ、成否にかかわらず同一の文言を表示する", async () => {
    let receivedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(apiUrl("/auth/password"), async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true });
      }),
    );

    const { getByPlaceholderText, getByText, findByText } =
      renderForgotPassword();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "reset@example.com",
    );
    fireEvent.press(getByText("送信する"));

    await findByText(GENERIC_MESSAGE);
    expect(receivedBody).toEqual({
      email: "reset@example.com",
      redirect_url: expect.any(String),
    });
  });

  it("送信が失敗しても同一の文言を表示する（アカウント列挙防止）", async () => {
    server.use(
      http.post(apiUrl("/auth/password"), () =>
        HttpResponse.json({ error: "not found" }, { status: 404 }),
      ),
    );

    const { getByPlaceholderText, getByText, findByText } =
      renderForgotPassword();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "notfound@example.com",
    );
    fireEvent.press(getByText("送信する"));

    await findByText(GENERIC_MESSAGE);
  });

  it("レート制限（429）のときは専用文言を表示し、送信完了画面に進まない", async () => {
    server.use(
      http.post(apiUrl("/auth/password"), () =>
        HttpResponse.json(
          {
            error: "rate_limit_exceeded",
            message: "試行回数が上限に達しました",
          },
          { status: 429 },
        ),
      ),
    );

    const { getByPlaceholderText, getByText, findByText, queryByText } =
      renderForgotPassword();

    fireEvent.changeText(
      getByPlaceholderText("email@example.com"),
      "limited@example.com",
    );
    fireEvent.press(getByText("送信する"));

    await findByText("試行回数が上限に達しました");
    expect(queryByText(GENERIC_MESSAGE)).toBeNull();
  });
});
