/**
 * 練習メニュー作成フォームのエラー表示の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import PracticeMenuFormScreen from "../form";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

describe("PracticeMenuFormScreen（新規）", () => {
  beforeEach(() => {
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () => HttpResponse.json([])),
    );
  });

  it("素振りメニューが重複して 422 になったらサーバーの理由を表示する", async () => {
    server.use(
      http.post(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json(
          { errors: ["「素振り」のメニューは既に登録されています"] },
          { status: 422 },
        ),
      ),
    );
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    renderWithProviders(<PracticeMenuFormScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("例: 素振り、ティー、ランニング"),
      "素振り",
    );
    fireEvent.press(screen.getByText("保存"));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "保存に失敗しました",
        "「素振り」のメニューは既に登録されています",
      ),
    );

    alertSpy.mockRestore();
  });
});
