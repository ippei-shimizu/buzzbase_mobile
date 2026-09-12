/**
 * ホームの目標管理セクションの振る舞いテスト。
 * 表示中の目標をタップすると目標詳細画面へ遷移することを確認する。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import { TodayGoalSection } from "../TodayGoalSection";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const goal = {
  id: 42,
  title: "月20日練習",
  kind: "numeric",
  period_type: "monthly",
  season_id: null,
  tournament_id: null,
  month_start: "2026-07-01",
  deadline: "2026-07-31",
  metric_key: "practice_days",
  target_value: 20,
  comparison_type: "greater_than",
  practice_menu_id: null,
  practice_menu_name: null,
  custom_metric_label: null,
  custom_unit: null,
  manual_current_value: 0,
  is_achieved: false,
  is_finalized: false,
  achieved_value: null,
  current_value: 5,
  progress_percent: 25.0,
  days_remaining: 10,
};

describe("TodayGoalSection", () => {
  it("表示中の目標をタップすると目標詳細画面へ遷移する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/goals"), () => HttpResponse.json([goal])),
    );

    renderWithProviders(<TodayGoalSection />);

    await waitFor(() =>
      expect(screen.getByText("月20日練習")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("月20日練習"));

    expect(getRouterSpies().push).toHaveBeenCalledWith({
      pathname: "/(goal)/[id]",
      params: { id: "42" },
    });
  });
});
