/**
 * 課題テーマ一覧の振る舞いテスト。
 * API が返す取組中の課題がサマリー付きで表示されることを確認する。
 */
import { waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import ThemeListScreen from "../list";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const openTheme = {
  id: 1,
  title: "肩の開きを抑える",
  category: "batting",
  purpose: null,
  status: "open",
  started_on: "2026-06-01",
  achieved_on: null,
  sort_order: 0,
  practice_logs_count: 8,
  notes_count: 3,
  active_days: 5,
  created_at: "2026-06-01T00:00:00Z",
};

describe("課題テーマ一覧", () => {
  it("取組中の課題をサマリー付きで表示する", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
      http.get(baseUrl("/api/v2/improvement_themes"), () =>
        HttpResponse.json([openTheme]),
      ),
    );

    const { getByText } = renderWithProviders(<ThemeListScreen />);

    await waitFor(() => {
      expect(getByText("肩の開きを抑える")).toBeTruthy();
    });
    expect(getByText(/取組5日/)).toBeTruthy();
  });
});
