export interface RecentGameResult {
  id: number;
  date: string;
  opponent_team_name: string | null;
  my_team_score: number;
  opponent_team_score: number;
  match_type: string;
  batting_average: {
    hit: number;
    at_bats: number;
    home_run: number;
    runs_batted_in: number;
  } | null;
  pitching_result: {
    innings_pitched: number;
    run_allowed: number;
    earned_run: number;
    strikeouts: number;
  } | null;
}

export interface BattingStats {
  aggregate: {
    number_of_matches: number;
    hit: number;
    two_base_hit: number;
    three_base_hit: number;
    home_run: number;
    total_bases: number;
    runs_batted_in: number;
    run: number;
    stealing_base: number;
    caught_stealing: number;
    times_at_bat: number;
    at_bats: number;
    base_on_balls: number;
    hit_by_pitch: number;
    sacrifice_hit: number;
    sacrifice_fly: number;
    strike_out: number;
    error: number;
  } | null;
  calculated: {
    batting_average: number;
    on_base_percentage: number;
    slugging_percentage: number;
    ops: number;
    iso: number;
    bb_per_k: number;
    isod: number;
  } | null;
}

export interface PitchingStats {
  aggregate: {
    number_of_appearances: number;
    win: number;
    loss: number;
    complete_games: number;
    shutouts: number;
    saves: number;
    hold: number;
    innings_pitched: number;
    hits_allowed: number;
    home_runs_hit: number;
    strikeouts: number;
    base_on_balls: number;
    hit_by_pitch: number;
    run_allowed: number;
    earned_run: number;
  } | null;
  calculated: {
    era: number;
    win_percentage: number;
    whip: number;
    k_per_nine: number;
    bb_per_nine: number;
    k_bb: number;
  } | null;
}

export interface RankingEntry {
  stat_type: string;
  label: string;
  current_rank: number | null;
  previous_rank: number | null;
  change: number | null;
  value: number | null;
}

export interface GroupRanking {
  group_id: number;
  group_name: string;
  group_icon: string | null;
  total_members: number;
  batting_rankings: RankingEntry[];
  pitching_rankings: RankingEntry[];
}

export interface DashboardData {
  recent_game_results: RecentGameResult[];
  batting_stats: BattingStats;
  pitching_stats: PitchingStats;
  group_rankings: GroupRanking[];
  available_years: number[];
}

export interface RadarAxis {
  label: string;
  metric: string;
  value: number;
  rawValue: string;
  description: string;
}
