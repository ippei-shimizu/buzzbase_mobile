/**
 * 日次の練習記録画面の振る舞いテスト。
 * 日付＋複数メニュー選択で、保存時に POST /api/v2/practice_sessions へ
 * 選択メニューが items として一括送信されることを確認する。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import DailyRecordScreen from "../daily";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const battingMenu = {
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: 200,
  is_favorite: false,
  sort_order: 0,
};

const setupHandlers = (onSave: (body: unknown) => void) => {
  server.use(
    http.get(baseUrl("/api/v2/practice_menus"), () =>
      HttpResponse.json([battingMenu]),
    ),
    http.get(baseUrl("/api/v2/practice_sessions/by_date"), () =>
      HttpResponse.json(null),
    ),
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
    http.post(baseUrl("/api/v2/practice_sessions"), async ({ request }) => {
      const body = await request.json();
      onSave(body);
      return HttpResponse.json(
        {
          id: 1,
          logged_on: "2026-06-27",
          memo: null,
          practice_logs: [],
          condition: null,
          created_at: "2026-06-27T00:00:00Z",
        },
        { status: 201 },
      );
    }),
  );
};

describe("日次の練習記録", () => {
  it("メニューを選んで保存すると practice_sessions に items を送信する", async () => {
    let savedBody: { practice_session?: { items?: unknown[] } } = {};
    setupHandlers((body) => {
      savedBody = body as typeof savedBody;
    });

    const { getByText } = renderWithProviders(<DailyRecordScreen />);

    await waitFor(() => expect(getByText("素振り")).toBeTruthy());

    fireEvent.press(getByText("素振り"));
    fireEvent.press(getByText("練習記録のみ保存"));

    await waitFor(() => expect(savedBody.practice_session).toBeTruthy());
    expect(savedBody.practice_session?.items).toEqual([
      expect.objectContaining({ practice_menu_id: 1 }),
    ]);
  });
});
