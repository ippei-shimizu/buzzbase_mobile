/**
 * username-registration 画面の振る舞いテスト。
 *
 * 登録 → 記録フロー開始は新規ユーザーのほぼ全員が通る区間のため、
 * 送信後の遷移先が変わったことに気づけるよう1件だけ固定する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import UsernameRegistrationScreen from "../username-registration";

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

describe("username-registration 画面", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("登録に成功するとプロフィール入力画面へ遷移する", async () => {
    server.use(http.put(apiUrl("/user"), () => HttpResponse.json({})));

    const screen = renderWithProviders(<UsernameRegistrationScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("大谷 一郎（ニックネーム可）"),
      "大谷 一郎",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("buzz_base235"),
      "buzz_base235",
    );
    fireEvent.press(screen.getByText("登録する"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith(
        "/(auth)/profile-setup",
      );
    });
  });

  it("登録に失敗したときは遷移せずエラーを表示する", async () => {
    server.use(
      http.put(apiUrl("/user"), () =>
        HttpResponse.json(
          { errors: { full_messages: ["ユーザーIDは既に使われています"] } },
          { status: 422 },
        ),
      ),
    );

    const screen = renderWithProviders(<UsernameRegistrationScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("大谷 一郎（ニックネーム可）"),
      "大谷 一郎",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("buzz_base235"),
      "buzz_base235",
    );
    fireEvent.press(screen.getByText("登録する"));

    await waitFor(() => {
      expect(screen.getByText("ユーザーIDは既に使われています")).toBeTruthy();
    });
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });
});
