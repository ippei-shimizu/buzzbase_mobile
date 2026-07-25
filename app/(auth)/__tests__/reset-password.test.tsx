/**
 * reset-password 画面の振る舞いテスト。HTTP 層は MSW で intercept。
 * ディープリンクで受け取ったワンタイムトークンは useLocalSearchParams 経由で渡される想定。
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
    searchParams: {
      accessToken: "reset-access-token",
      client: "reset-client",
      uid: "reset@example.com",
    },
  });
});
/* eslint-enable @typescript-eslint/no-require-imports */

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isLoggedIn: false, isLoading: false });
});

const renderResetPassword = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Screen = require("../reset-password").default;
  return renderWithProviders(<Screen />);
};

describe("reset-password: 新しいパスワードの設定", () => {
  it("送信するとワンタイムトークンをヘッダーに指定してPUT /auth/passwordが呼ばれる", async () => {
    let receivedHeaders: Record<string, string> = {};
    let receivedBody: Record<string, unknown> | null = null;
    server.use(
      http.put(apiUrl("/auth/password"), async ({ request }) => {
        receivedHeaders = Object.fromEntries(request.headers.entries());
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true });
      }),
    );

    const { getByPlaceholderText, getByText, findByText } =
      renderResetPassword();

    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "newPassword123",
    );
    fireEvent.changeText(
      getByPlaceholderText("もう一度入力してください"),
      "newPassword123",
    );
    fireEvent.press(getByText("パスワードを変更する"));

    await findByText("パスワードを更新しました。ログイン画面に移動します。");
    expect(receivedHeaders["access-token"]).toBe("reset-access-token");
    expect(receivedHeaders["client"]).toBe("reset-client");
    expect(receivedHeaders["uid"]).toBe("reset@example.com");
    expect(receivedBody).toEqual({
      password: "newPassword123",
      password_confirmation: "newPassword123",
    });
  });

  it("確認用パスワードが一致しない場合は送信ボタンが無効のままでPUTが呼ばれない", () => {
    let requested = false;
    server.use(
      http.put(apiUrl("/auth/password"), () => {
        requested = true;
        return HttpResponse.json({ success: true });
      }),
    );

    const { getByPlaceholderText, getByText } = renderResetPassword();

    fireEvent.changeText(
      getByPlaceholderText("6文字以上の半角英数字"),
      "newPassword123",
    );
    fireEvent.changeText(
      getByPlaceholderText("もう一度入力してください"),
      "different456",
    );
    fireEvent.press(getByText("パスワードを変更する"));

    expect(requested).toBe(false);
  });
});
