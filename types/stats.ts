export interface HitDirection {
  id: number;
  label: string;
  count: number;
  top_category: string;
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
  earned_run: number;
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
