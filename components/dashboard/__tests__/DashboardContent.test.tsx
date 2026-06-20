/**
 * DashboardContent の振る舞いテスト。
 *
 * 新規ユーザー相当（試合記録ゼロ）の空データを渡したとき、打撃・試合結果の
 * EmptyState に「初めての試合を記録する」CTA が出て、タップで試合記録ウィザードへ
 * 遷移すること、投手 EmptyState には CTA が出ないことを確認する。
 *
 * 方針: サービス関数は jest.mock せず、子フックが叩く HTTP を MSW で intercept する。
 * expo-router のみモックして遷移発火を assert する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import type { DashboardData } from "../../../types/dashboard";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DashboardContent } from "../DashboardContent";

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

const emptyData: DashboardData = {
  recent_game_results: [],
  batting_stats: { aggregate: null, calculated: null },
  pitching_stats: { aggregate: null, calculated: null },
  group_rankings: [],
  available_years: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  // StatsOverview / RecentGameResults 配下のフックがマウント時に叩く HTTP を intercept する。
  server.use(
    http.get(apiUrl("/user"), () => HttpResponse.json({ id: 1 })),
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

const renderDashboard = (data: DashboardData = emptyData) =>
  renderWithProviders(
    <DashboardContent data={data} isRefreshing={false} onRefresh={jest.fn()} />,
  );

// 通算（フィルターなし）の打撃データを持つ既存ユーザー。
const existingUserData: DashboardData = {
  recent_game_results: [
    {
      id: 1,
      date: "2024-05-01",
      opponent_team_name: "対戦相手",
      my_team_score: 3,
      opponent_team_score: 1,
      match_type: "regular",
      batting_average: null,
      pitching_result: null,
    },
  ],
  batting_stats: {
    aggregate: {
      number_of_matches: 10,
      hit: 12,
      two_base_hit: 2,
      three_base_hit: 0,
      home_run: 1,
      total_bases: 18,
      runs_batted_in: 8,
      run: 6,
      stealing_base: 1,
      caught_stealing: 0,
      times_at_bat: 40,
      at_bats: 36,
      base_on_balls: 3,
      hit_by_pitch: 1,
      sacrifice_hit: 0,
      sacrifice_fly: 0,
      strike_out: 7,
      error: 1,
    },
    calculated: {
      batting_average: 0.333,
      on_base_percentage: 0.4,
      slugging_percentage: 0.5,
      ops: 0.9,
      iso: 0.167,
      bb_per_k: 0.43,
      isod: 0.067,
    },
  },
  pitching_stats: { aggregate: null, calculated: null },
  group_rankings: [],
  available_years: [],
};

describe("DashboardContent: 空データ時の初回試合記録 CTA", () => {
  it("打撃・試合結果の EmptyState に CTA を表示し、投手には表示しない", async () => {
    const { getAllByText, getByText } = renderDashboard();

    await waitFor(() => {
      expect(getByText("投手データがありません")).toBeTruthy();
    });

    // 打撃・試合結果の 2 箇所のみ CTA が出る（投手には出ない）。
    expect(getAllByText("初めての試合を記録する")).toHaveLength(2);
  });

  it("CTA タップで試合記録ウィザードへ遷移する", async () => {
    const { getAllByText } = renderDashboard();

    const ctaButtons = await waitFor(() => {
      const buttons = getAllByText("初めての試合を記録する");
      expect(buttons).toHaveLength(2);
      return buttons;
    });

    fireEvent.press(ctaButtons[0]);

    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(game-record)/step1-game-info",
    );
  });
});

describe("DashboardContent: 既存ユーザーへの CTA 誤表示防止", () => {
  it("通算データありのユーザーがフィルターで空表示になっても打撃 CTA を出さない", async () => {
    // フィルター適用後の打撃 stats を「一致試合なし（aggregate null）」で返す。
    server.use(
      http.get(baseUrl("/api/v2/dashboard/batting_stats"), () =>
        HttpResponse.json({ aggregate: null, calculated: null }),
      ),
    );

    const { getByText, getAllByText, queryByText } =
      renderDashboard(existingUserData);

    // 初期表示（フィルターなし）は通算データありなので EmptyState も CTA も出ない。
    await waitFor(() => {
      expect(getByText("打撃成績")).toBeTruthy();
    });
    expect(queryByText("初めての試合を記録する")).toBeNull();

    // 打撃の「種別」フィルターを開いて「オープン戦」を選択する。
    // 直近試合カードが「公式戦」を表示するため、選択肢は一意な「オープン戦」を使う。
    fireEvent.press(getAllByText("種別: 全て")[0]);
    fireEvent.press(getByText("オープン戦"));

    // フィルター結果が空になり EmptyState が出ても、既存ユーザーには CTA を出さない。
    await waitFor(() => {
      expect(getByText("打撃データがありません")).toBeTruthy();
    });
    expect(queryByText("初めての試合を記録する")).toBeNull();
  });
});
