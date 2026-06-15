export interface HitDirection {
  id: number;
  label: string;
  count: number;
  top_category: string;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
}

export interface HitLocationPoint {
  x: number;
  y: number;
  plate_result_id: number;
}

export interface HitLocationData {
  points: HitLocationPoint[];
}

export interface OutTypeBreakdownCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface OutTypeBreakdownData {
  breakdown: OutTypeBreakdownCategory[];
  total: number;
}

/**
 * カウント別分析カード（初球 / 有利カウント / 追い込み）の 1 セル分。
 */
export interface CountSituation {
  at_bats: number;
  hits: number;
  batting_average: number;
}

/**
 * stats 打撃のカウント別分析レスポンス。
 * `first_pitch_swing` / `final_balls` / `final_strikes` の記録がある新仕様 PA のみが対象。
 */
export interface CountSituations {
  first_pitch: CountSituation;
  favorable_count: CountSituation;
  pinch_count: CountSituation;
  total_target_pa: number;
}

export interface HomeRunDirection {
  id: number;
  label: string;
  count: number;
}

export interface HitDirectionData {
  directions: HitDirection[];
  home_runs: HomeRunDirection[];
}

export interface PlateAppearanceCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface BattingStatsRow {
  label: string;
  opponent?: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hit: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
  runs_batted_in: number;
  run: number;
  strike_out: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  caught_stealing: number;
  error: number;
  batting_average: number;
  slugging_percentage: number;
  ops: number;
  iso: number;
  bb_per_k: number;
  babip: number;
}

export interface PitchingStatsRow {
  label: string;
  opponent?: string;
  appearances: number;
  win: number;
  loss: number;
  hold: number;
  saves: number;
  complete_games: number;
  shutouts: number;
  innings_pitched: number;
  hits_allowed: number;
  home_runs_hit: number;
  strikeouts: number;
  base_on_balls: number;
  hit_by_pitch: number;
  run_allowed: number;
  earned_run: number;
  number_of_pitches: number;
  era: number;
  whip: number;
  k_per_nine: number;
  bb_per_nine: number;
  k_bb: number;
  win_percentage: number;
}

export interface WinLossSummary {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  win_rate: number;
}

export interface MonthlyGame {
  month: number;
  count: number;
}

export interface OpponentRecord {
  team_name: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
}

export interface EraTrendPoint {
  month: number;
  era: number;
}

export interface Scoring {
  runs_for: number;
  runs_against: number;
  run_differential: number;
  avg_runs_for: number;
  avg_runs_against: number;
}

export interface RecentFormGame {
  game_result_id: number;
  date: string;
  match_type: string | null;
  opponent: string;
  result: "win" | "loss" | "draw";
  my_score: number;
  opponent_score: number;
}

export interface GameSummary {
  win_loss: WinLossSummary;
  scoring: Scoring;
  recent_form: RecentFormGame[];
  monthly_games: MonthlyGame[];
  opponent_records: OpponentRecord[];
}

export type StatsPeriod = "yearly" | "monthly" | "daily";

/**
 * stats タブ打撃セクション最上部の主要スタッツカード用レスポンス。
 * OBP / SLG / OPS はサーバー側で計算済（小数 3 桁）。
 */
export interface HeadlineStats {
  batting_average: number;
  hit: number;
  home_run: number;
  runs_batted_in: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  at_bats: number;
}

/**
 * 得点圏（runners_state IN 2..7）に絞った打撃集計。
 * 母数 0 のときも nil ではなく 0 / 0.0 が返るので、`at_bats === 0` で
 * mobile 側を「対象データなし」UI に分岐させる。
 */
export interface RunnersSituationSummary {
  batting_average: number;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
}
