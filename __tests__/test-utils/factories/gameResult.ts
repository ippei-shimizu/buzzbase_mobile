import type {
  GameResult,
  GameResultBattingAverage,
  GameResultMatchResult,
  GameResultPitchingResult,
  PlateAppearance,
} from "../../../types/gameResult";

export const buildMatchResult = (
  overrides: Partial<GameResultMatchResult> = {},
): GameResultMatchResult => ({
  id: 1,
  date_and_time: "2026-05-01T13:00:00.000Z",
  match_type: "公式戦",
  my_team_id: 10,
  opponent_team_id: 20,
  my_team_score: 5,
  opponent_team_score: 3,
  batting_order: "3",
  defensive_position: "投手",
  tournament_id: null,
  memo: null,
  inning_format: 9,
  my_team_name: "テストイーグルス",
  opponent_team_name: "テストライオンズ",
  tournament_name: null,
  ...overrides,
});

export const buildBattingAverage = (
  overrides: Partial<GameResultBattingAverage> = {},
): GameResultBattingAverage => ({
  id: 1,
  plate_appearances: 4,
  times_at_bat: 4,
  hit: 2,
  two_base_hit: 1,
  three_base_hit: 0,
  home_run: 0,
  total_bases: 3,
  runs_batted_in: 2,
  run: 1,
  strike_out: 1,
  base_on_balls: 0,
  hit_by_pitch: 0,
  sacrifice_hit: 0,
  sacrifice_fly: 0,
  stealing_base: 0,
  caught_stealing: 0,
  at_bats: 4,
  error: 0,
  ...overrides,
});

export const buildPitchingResult = (
  overrides: Partial<GameResultPitchingResult> = {},
): GameResultPitchingResult => ({
  id: 1,
  win: 1,
  loss: 0,
  hold: 0,
  saves: 0,
  innings_pitched: 7,
  number_of_pitches: 95,
  got_to_the_distance: false,
  run_allowed: 2,
  earned_run: 2,
  hits_allowed: 5,
  home_runs_hit: 0,
  strikeouts: 8,
  base_on_balls: 2,
  hit_by_pitch: 0,
  ...overrides,
});

export const buildPlateAppearance = (
  overrides: Partial<PlateAppearance> = {},
): PlateAppearance => ({
  id: 1,
  batter_box_number: 1,
  batting_result: "ヒット",
  game_result_id: 100,
  batting_position_id: 1,
  plate_result_id: 1,
  ...overrides,
});

/**
 * GameResult のテストデータビルダー。
 *
 * ネストオブジェクト（match_result / batting_average / pitching_result）は
 * Partial で受け、それぞれの build* 関数経由でデフォルト値とマージする。
 * batting_average / pitching_result に明示的に `null` を渡すと、サーバーレスポンスで
 * 該当成績が無い状態を再現できる。
 */
interface BuildGameResultOverrides {
  game_result_id?: number;
  user_id?: number;
  season_id?: number | null;
  season_name?: string | null;
  match_result?: Partial<GameResultMatchResult>;
  plate_appearances?: PlateAppearance[];
  batting_average?: Partial<GameResultBattingAverage> | null;
  pitching_result?: Partial<GameResultPitchingResult> | null;
}

export const buildGameResult = (
  overrides: BuildGameResultOverrides = {},
): GameResult => {
  const battingAverage =
    overrides.batting_average === null
      ? null
      : buildBattingAverage(overrides.batting_average);
  const pitchingResult =
    overrides.pitching_result === null
      ? null
      : buildPitchingResult(overrides.pitching_result);

  return {
    game_result_id: overrides.game_result_id ?? 100,
    user_id: overrides.user_id ?? 1,
    season_id: overrides.season_id ?? 1,
    season_name: overrides.season_name ?? "2026シーズン",
    match_result: buildMatchResult(overrides.match_result),
    plate_appearances: overrides.plate_appearances ?? [
      buildPlateAppearance({ id: 1, batter_box_number: 1 }),
      buildPlateAppearance({
        id: 2,
        batter_box_number: 2,
        batting_position_id: 2,
        plate_result_id: 2,
      }),
    ],
    batting_average: battingAverage,
    pitching_result: pitchingResult,
  };
};
