/**
 * 月末に確定した目標の達成サマリーモーダルの振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { previousMonthKey } from "../../../utils/achievementSummary";
import { AchievementSummaryModal } from "../AchievementSummaryModal";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const getSecureStore = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("expo-secure-store") as {
    getItemAsync: jest.Mock;
    setItemAsync: jest.Mock;
  };

// previousMonthKey()と同じ月の"15日"をdeadline/awarded_atとして使う（月内であれば日は問わない）。
const dateInPreviousMonth = () => `${previousMonthKey()}-15`;

const buildFinalizedGoal = (id: number, isAchieved: boolean) => ({
  id,
  title: `目標${id}`,
  kind: "numeric",
  period_type: "monthly",
  season_id: null,
  tournament_id: null,
  month_start: dateInPreviousMonth(),
  deadline: dateInPreviousMonth(),
  metric_key: "practice_days",
  target_value: 20,
  comparison_type: "greater_than",
  practice_menu_id: null,
  practice_menu_name: null,
  custom_metric_label: null,
  custom_unit: null,
  manual_current_value: 0,
  is_achieved: isAchieved,
  is_finalized: true,
  achieved_value: isAchieved ? 20 : 10,
  current_value: isAchieved ? 20 : 10,
  progress_percent: isAchieved ? 100 : 50,
  days_remaining: 0,
});

const setupHistoryAndBadges = (history: unknown[], badges: unknown[] = []) => {
  server.use(
    http.get(baseUrl("/api/v2/goals/history"), () =>
      HttpResponse.json(history),
    ),
    http.get(baseUrl("/api/v2/goal_badges"), () => HttpResponse.json(badges)),
  );
};

describe("AchievementSummaryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSecureStore().getItemAsync.mockResolvedValue(null);
  });

  it("前月に確定した目標があり未表示なら、達成件数付きでモーダルを表示する", async () => {
    setupHistoryAndBadges([
      buildFinalizedGoal(1, true),
      buildFinalizedGoal(2, false),
    ]);

    renderWithProviders(<AchievementSummaryModal />);

    expect(await screen.findByText(/期限を迎えた目標 2件中/)).toBeOnTheScreen();
    expect(screen.getByText("1件達成")).toBeOnTheScreen();
  });

  it("前月に確定した目標が無ければモーダルを表示しない", async () => {
    setupHistoryAndBadges([]);

    renderWithProviders(<AchievementSummaryModal />);

    await waitFor(() => {
      expect(screen.queryByText(/期限を迎えた目標/)).toBeNull();
    });
  });

  it("その月分を既に表示済みならモーダルを表示しない", async () => {
    getSecureStore().getItemAsync.mockResolvedValue(previousMonthKey());
    setupHistoryAndBadges([buildFinalizedGoal(1, true)]);

    renderWithProviders(<AchievementSummaryModal />);

    await waitFor(() => {
      expect(screen.queryByText(/期限を迎えた目標/)).toBeNull();
    });
  });

  it("閉じるを押すと表示済みフラグを保存してモーダルを閉じる", async () => {
    setupHistoryAndBadges([buildFinalizedGoal(1, true)]);

    renderWithProviders(<AchievementSummaryModal />);

    fireEvent.press(await screen.findByText("閉じる"));

    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "achievement_summary_last_shown_period",
      previousMonthKey(),
    );
    await waitFor(() => {
      expect(screen.queryByText(/期限を迎えた目標/)).toBeNull();
    });
  });

  it("バッジを見るを押すとバッジ一覧へ遷移する", async () => {
    setupHistoryAndBadges(
      [buildFinalizedGoal(1, true)],
      [
        {
          id: 1,
          badge_type: "monthly_achieved",
          badge_name: "月間目標達成",
          awarded_at: dateInPreviousMonth(),
          goal_id: 1,
          goal_title: "目標1",
        },
      ],
    );

    renderWithProviders(<AchievementSummaryModal />);

    expect(await screen.findByText(/新しいバッジを1個獲得/)).toBeOnTheScreen();
    fireEvent.press(screen.getByText("バッジを見る"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(goal)/badges");
  });
});
