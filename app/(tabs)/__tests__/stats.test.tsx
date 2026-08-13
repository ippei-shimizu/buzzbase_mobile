/**
 * 成績画面の振る舞いテスト。
 * 打撃と投球の切り替えで、表示中のタブの内容だけが見えることを担保する。
 * この画面はタブ本文が広く、横スワイプ対応で構造を変えるため回帰の網として置く。
 */
import type { JsonBodyType } from "msw";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import StatsScreen from "../stats";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
}));

// ナビゲーション境界: テストにはヘッダーコンテキストが無く useHeaderHeight が throw するためモックする
jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 0,
}));

/** AdditionalStatsCard は各項目を直接参照するため、型どおりのゼロ値を返す。 */
const EMPTY_ADDITIONAL_STATS = {
  games: 0,
  plate_appearances: 0,
  two_base_hit: 0,
  three_base_hit: 0,
  total_bases: 0,
  run: 0,
  strike_out: 0,
  swinging_strike_out: 0,
  looking_strike_out: 0,
  base_on_balls: 0,
  hit_by_pitch: 0,
  sacrifice_hit: 0,
  sacrifice_fly: 0,
  stealing_base: 0,
  caught_stealing: 0,
  iso: 0,
  isod: 0,
  bb_per_k: 0,
};

/** 各エンドポイントが返す形。空でも「キーが存在すること」が必要な箇所がある。 */
const EMPTY_STATS_RESPONSES: Record<string, JsonBodyType> = {
  headline_stats: {},
  additional_stats: EMPTY_ADDITIONAL_STATS,
  batting_trend: { granularity: "game", points: [] },
  era_trend: { granularity: "game", points: [] },
  runners_situation: { rows: [] },
  count_situations: { rows: [] },
  contact_qualities: { breakdown: [], total: 0 },
  timing_breakdown: { breakdown: [], total: 0 },
  hit_directions: { directions: [], home_runs: [] },
  hit_locations: { points: [] },
  pitch_types: { rows: [], total_target_pa: 0 },
  pitcher_faceoffs: { rows: [], total_target_pa: 0, min_plate_appearances: 0 },
  pitcher_attribute_summary: {
    by_throw_hand: [],
    by_arm_angle: [],
    by_velocity_zone: [],
    by_pitcher_style: [],
  },
  plate_appearance_breakdown: { breakdown: [] },
  batting: { rows: [] },
  pitching: { rows: [] },
};

/** 成績画面はマウント時に多数のクエリを走らせるため、まとめて空を返す。 */
const respondWithEmptyStats = () => {
  server.use(
    ...Object.entries(EMPTY_STATS_RESPONSES).map(([path, body]) =>
      http.get(baseUrl(`/api/v2/stats/${path}`), () => HttpResponse.json(body)),
    ),
    http.get(apiUrl("/match_results/available_years"), () =>
      HttpResponse.json([]),
    ),
    http.get(apiUrl("/seasons"), () => HttpResponse.json([])),
    http.get(apiUrl("/tournaments/user_tournaments"), () =>
      HttpResponse.json([]),
    ),
  );
};

describe("成績画面のタブ切り替え", () => {
  it("既定では打撃の内容を表示する", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    expect(screen.queryByText("投球成績")).toBeNull();
  });

  it("投球タブに切り替えると投球の内容だけを表示する", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("投球"));

    await waitFor(() => expect(screen.getByText("投球成績")).toBeOnTheScreen());
    expect(screen.queryByText("打撃成績")).toBeNull();
  });

  it("打撃タブへ戻せる", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("投球"));
    await waitFor(() => expect(screen.getByText("投球成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("打撃"));

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    expect(screen.queryByText("投球成績")).toBeNull();
  });
});
