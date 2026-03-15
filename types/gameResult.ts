export interface GameResultMatchResult {
  id: number;
  date_and_time: string;
  match_type: string;
  my_team_id: number;
  opponent_team_id: number;
  my_team_score: number;
  opponent_team_score: number;
  batting_order: string;
  defensive_position: string;
  tournament_id: number | null;
  memo: string | null;
  opponent_team_name: string;
  tournament_name: string | null;
}

export interface PlateAppearance {
  id: number;
  batter_box_number: number;
  batting_result: string;
  game_result_id: number;
}

export interface GameResultBattingAverage {
  plate_appearances: number;
  times_at_bat: number;
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
  at_bats: number;
  error: number;
}

export interface GameResultPitchingResult {
  win: number;
  loss: number;
  hold: number;
  saves: number;
  innings_pitched: number;
  number_of_pitches: number;
  got_to_the_distance: boolean;
  run_allowed: number;
  earned_run: number;
  hits_allowed: number;
  home_runs_hit: number;
  strikeouts: number;
  base_on_balls: number;
  hit_by_pitch: number;
}

export interface GameResult {
  game_result_id: number;
  season_id: number | null;
  season_name: string | null;
  match_result: GameResultMatchResult;
  plate_appearances: PlateAppearance[];
  batting_average: GameResultBattingAverage | null;
  pitching_result: GameResultPitchingResult | null;
}

export interface GameResultsResponse {
  data: GameResult[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}
