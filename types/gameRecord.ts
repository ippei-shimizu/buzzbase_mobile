export interface Team {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface MatchResultPayload {
  game_result_id: number;
  date_and_time: string;
  match_type: string;
  my_team_id: number;
  opponent_team_id: number;
  my_team_score: number;
  opponent_team_score: number;
  batting_order: string;
  defensive_position: string;
  memo: string;
  tournament_id?: number;
}

export interface BattingAveragePayload {
  game_result_id: number;
  user_id: number;
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

export interface PitchingResultPayload {
  game_result_id: number;
  user_id: number;
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

export interface GameResultUpdatePayload {
  match_result_id?: number;
  season_id?: number | null;
}

export interface UpdateBattingAverageIdPayload {
  batting_average_id: number;
}

export interface UpdatePitchingResultIdPayload {
  pitching_result_id: number;
}

export interface BattingBox {
  id: number;
  position: number;
  result: number;
  text: string;
}
