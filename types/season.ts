export interface Season {
  id: number;
  name: string;
  game_results_count: number;
  created_at: string;
  updated_at: string;
}

export interface SeasonParams {
  name: string;
}
