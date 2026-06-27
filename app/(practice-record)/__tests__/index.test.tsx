/**
 * 練習メニュー一覧画面の振る舞いテスト。
 * GET /api/v2/practice_menus の結果を表示し、空なら空状態ガイドを出すことを確認する。
 */
import { waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import PracticeMenuListScreen from "../index";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

describe("練習メニュー一覧", () => {
  it("登録済みメニューを表示する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json([
          {
            id: 1,
            name: "素振り",
            category: "batting",
            unit: "count",
            unit_label: "本",
            default_value: 200,
            is_favorite: true,
            sort_order: 0,
          },
        ]),
      ),
    );

    const { getByText } = renderWithProviders(<PracticeMenuListScreen />);

    await waitFor(() => expect(getByText(/素振り/)).toBeTruthy());
  });

  it("メニューが無ければ空状態ガイドを表示する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () => HttpResponse.json([])),
    );

    const { getByText } = renderWithProviders(<PracticeMenuListScreen />);

    await waitFor(() =>
      expect(getByText("まだ練習メニューがありません")).toBeTruthy(),
    );
  });
});
