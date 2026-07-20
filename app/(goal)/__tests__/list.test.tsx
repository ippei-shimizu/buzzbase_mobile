/**
 * 目標一覧画面の「新しい目標を追加」ボタンの Pro 制限（無料は個人の期間目標2件まで）の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS, FREE_FEATURES } from "../../../types/pro";
import GoalListScreen from "../list";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const buildGoal = (id: number, periodType: string) => ({
  id,
  title: `目標${id}`,
  kind: "numeric",
  period_type: periodType,
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
});

const respondFree = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
  );
};

const respondPro = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "active",
          pro_active: true,
          expires_at: "2026-12-31T00:00:00+09:00",
          days_remaining: 30,
        },
        entitlements: [...FREE_FEATURES, "unlimited_monthly_goals"],
      }),
    ),
  );
};

const setupGoals = (goals: unknown[]) => {
  server.use(
    http.get(baseUrl("/api/v2/goals"), () => HttpResponse.json(goals)),
    http.get(baseUrl("/api/v2/goals/history"), () => HttpResponse.json([])),
  );
};

describe("GoalListScreen", () => {
  it("無料ユーザーが個人目標を既に2件持っていると、追加ボタンでPro訴求が出て遷移しない", async () => {
    respondFree();
    setupGoals([buildGoal(1, "monthly"), buildGoal(2, "weekly")]);

    renderWithProviders(<GoalListScreen />);

    await waitFor(() =>
      expect(screen.getByText("新しい目標を追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("新しい目標を追加"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(getRouterSpies().push).not.toHaveBeenCalledWith("/(goal)/new");
  });

  it("無料ユーザーが個人目標1件のみなら、追加ボタンで新規作成画面へ遷移する", async () => {
    respondFree();
    setupGoals([buildGoal(1, "monthly")]);

    renderWithProviders(<GoalListScreen />);

    await waitFor(() =>
      expect(screen.getByText("新しい目標を追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("新しい目標を追加"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(goal)/new");
  });

  it("Proユーザーは個人目標が2件以上でも追加ボタンで新規作成画面へ遷移する", async () => {
    respondPro();
    setupGoals([buildGoal(1, "monthly"), buildGoal(2, "weekly")]);

    renderWithProviders(<GoalListScreen />);

    await waitFor(() =>
      expect(screen.getByText("新しい目標を追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("新しい目標を追加"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(goal)/new");
  });
});
