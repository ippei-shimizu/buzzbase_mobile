/**
 * 目標一覧画面の「新しい目標を追加」ボタンの Pro 制限（無料は個人の期間目標2件まで）の振る舞いテスト。
 */
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import * as StoreReview from "expo-store-review";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import {
  resetStoreReviewStorage,
  seedEligibleStoreReview,
} from "../../../__tests__/test-utils/storeReview";
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

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  requestReview: jest.fn().mockResolvedValue(undefined),
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

afterEach(resetStoreReviewStorage);

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

  it("定性目標を「達成にする」と、ストアレビューを要求する", async () => {
    respondFree();
    seedEligibleStoreReview();
    const qualitativeGoal = {
      ...buildGoal(1, "monthly"),
      kind: "qualitative",
      metric_key: null,
      target_value: null,
    };
    setupGoals([qualitativeGoal]);
    server.use(
      http.post(baseUrl("/api/v2/goals/1/achievement"), () =>
        HttpResponse.json({ ...qualitativeGoal, is_achieved: true }),
      ),
    );

    renderWithProviders(<GoalListScreen />);

    fireEvent.press(await screen.findByRole("button", { name: "達成にする" }));

    await waitFor(() =>
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1),
    );
  });

  it("同じ目標で達成と取り消しを繰り返しても、ポジティブイベントは1件だけ数える", async () => {
    respondFree();
    const storage = seedEligibleStoreReview();
    const qualitativeGoal = {
      ...buildGoal(2, "monthly"),
      kind: "qualitative",
      metric_key: null,
      target_value: null,
    };
    let isAchieved = false;
    const currentGoal = () => ({ ...qualitativeGoal, is_achieved: isAchieved });
    server.use(
      http.get(baseUrl("/api/v2/goals"), () =>
        HttpResponse.json([currentGoal()]),
      ),
      http.get(baseUrl("/api/v2/goals/history"), () => HttpResponse.json([])),
      http.post(baseUrl("/api/v2/goals/2/achievement"), () => {
        isAchieved = true;
        return HttpResponse.json(currentGoal());
      }),
      http.delete(baseUrl("/api/v2/goals/2/achievement"), () => {
        isAchieved = false;
        return HttpResponse.json(currentGoal());
      }),
    );

    renderWithProviders(<GoalListScreen />);

    fireEvent.press(await screen.findByRole("button", { name: "達成にする" }));
    await waitFor(() =>
      expect(storage.get("store_review_positive_event_count")).toBe("2"),
    );

    fireEvent.press(screen.getByRole("tab", { name: "達成" }));
    fireEvent.press(
      await screen.findByRole("button", { name: "達成を取り消す" }),
    );
    fireEvent.press(screen.getByRole("tab", { name: "進行中" }));
    fireEvent.press(await screen.findByRole("button", { name: "達成にする" }));
    await waitFor(() => expect(isAchieved).toBe(true));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(storage.get("store_review_positive_event_count")).toBe("2");
  });
});
