/**
 * ダッシュボードのグループ順位からストアレビューを要求する振る舞いテスト。
 * 上位3位に入っていなくても、前回より順位が上がっていれば要求の対象になる。
 */
import type { RankingEntry } from "../../../types/dashboard";
import { act, screen, waitFor } from "@testing-library/react-native";
import * as StoreReview from "expo-store-review";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../__tests__/test-utils/renderWithProviders";
import {
  resetStoreReviewStorage,
  seedEligibleStoreReview,
} from "../../../__tests__/test-utils/storeReview";
import { server } from "../../../jest-setup-msw";
import { DashboardView } from "../DashboardView";

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

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  isPostHogEnabled: true,
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

const buildRanking = (
  currentRank: number | null,
  previousRank: number | null,
): RankingEntry => ({
  stat_type: "batting_average",
  label: "打率",
  current_rank: currentRank,
  previous_rank: previousRank,
  change:
    currentRank !== null && previousRank !== null
      ? previousRank - currentRank
      : null,
  value: 0.25,
});

const respondDashboard = (ranking: RankingEntry) => {
  server.use(
    http.get(baseUrl("/api/v2/dashboard"), () =>
      HttpResponse.json({
        recent_game_results: [],
        batting_stats: { aggregate: null, calculated: null },
        pitching_stats: { aggregate: null, calculated: null },
        group_rankings: [
          {
            group_id: 1,
            group_name: "テストグループ",
            group_icon: null,
            total_members: 10,
            batting_rankings: [ranking],
            pitching_rankings: [],
          },
        ],
        available_years: [],
      }),
    ),
  );
};

afterEach(resetStoreReviewStorage);

beforeEach(() => {
  jest.clearAllMocks();
  seedEligibleStoreReview();
  server.use(
    http.get(apiUrl("/user"), () =>
      HttpResponse.json({ id: 1, user_id: null }),
    ),
    http.get(apiUrl("/seasons"), () => HttpResponse.json([])),
    http.get(apiUrl("/match_results/available_years"), () =>
      HttpResponse.json([]),
    ),
    http.get(apiUrl("/tournaments/user_tournaments"), () =>
      HttpResponse.json([]),
    ),
    http.get(baseUrl("/api/v2/dashboard/batting_stats"), () =>
      HttpResponse.json({ aggregate: null, calculated: null }),
    ),
    http.get(baseUrl("/api/v2/dashboard/pitching_stats"), () =>
      HttpResponse.json({ aggregate: null, calculated: null }),
    ),
  );
});

// 「同セッション1回まで」の記録はモジュールスコープに残り、テスト間でリセットされない。
// 先に発火するテストがあると後続の不発が sessionKey のせいで成立してしまうため、不発側を先に置く。
describe("DashboardView", () => {
  it("順位が前回と変わらず上位3位にも入っていなければ、レビューを要求しない", async () => {
    respondDashboard(buildRanking(5, 5));

    renderWithProviders(<DashboardView />);

    expect(await screen.findByText("BUZZ BASEへようこそ")).toBeOnTheScreen();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
  });

  it("上位3位に入っていなくても順位が上がればレビューを要求し、同セッション中に上位3位に入っても二重に数えない", async () => {
    const storage = seedEligibleStoreReview();
    const queryClient = createTestQueryClient();
    respondDashboard(buildRanking(5, 7));

    renderWithProviders(<DashboardView />, { queryClient });

    await waitFor(() =>
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1),
    );
    expect(mockCapture).toHaveBeenCalledWith("store review requested", {
      trigger: "dashboard_rank_up",
    });
    expect(storage.get("store_review_positive_event_count")).toBe("2");

    respondDashboard(buildRanking(2, 5));
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(storage.get("store_review_positive_event_count")).toBe("2");
  });
});
