/**
 * v2 打席記録 API の型定義。
 * back の `app/serializers/v2/plate_appearance_serializer.rb` と `app/models/plate_appearance.rb` に揃える。
 * snake_case はバックエンドの慣習に従う（mobile プロジェクトルール）。
 */

import type { Pitcher } from "./pitcher";
import type {
  AppearanceSituationMaster,
  ContactQualityMaster,
  HitDepthMaster,
  PitchTypeMaster,
  TimingMaster,
} from "./plateAppearanceMasters";

/** アウト種別（`plate_appearances.out_type` enum）。サーバーから文字列で返る。 */
export type OutType =
  | "ground_ball"
  | "fly_ball"
  | "line_drive"
  | "double_play"
  | "foul_fly";

/** ヒット種別（`plate_appearances.hit_type` enum）。 */
export type HitType = "single" | "double" | "triple" | "home_run";

/** ランナー状況（`plate_appearances.runners_state` enum）。 */
export type RunnersState =
  | "no_runner"
  | "first"
  | "second"
  | "third"
  | "first_second"
  | "first_third"
  | "second_third"
  | "bases_loaded";

/**
 * v2 plate_appearance のレスポンス形。
 * decimal 型 (`hit_location_x` / `hit_location_y`) は文字列で返る。
 */
export interface PlateAppearanceV2 {
  id: number;
  game_result_id: number;
  user_id: number;
  batter_box_number: number;
  batting_result: string;
  plate_result_id: number;
  hit_direction_id: number | null;
  batting_position_id: number | null;
  out_type: OutType | null;
  hit_type: HitType | null;
  hit_location_x: string | null;
  hit_location_y: string | null;
  rbi: number | null;
  run_scored: number | null;
  stolen_bases: number | null;
  caught_stealing: number | null;
  final_balls: number | null;
  final_strikes: number | null;
  final_outs: number | null;
  first_pitch_swing: boolean | null;
  runners_state: RunnersState | null;
  inning: number | null;
  self_analysis_memo: string | null;
  opponent_memo: string | null;
  is_new_format: boolean;
  has_detail_data: boolean;
  contact_quality: ContactQualityMaster | null;
  timing: TimingMaster | null;
  pitch_type: PitchTypeMaster | null;
  hit_depth: HitDepthMaster | null;
  pitcher: Pitcher | null;
  appearance_situation: AppearanceSituationMaster | null;
  created_at: string;
  updated_at: string;
}

/**
 * POST/PATCH /api/v2/plate_appearances のリクエスト本体に入る `plate_appearance` 部分。
 * 詳細データ（contact_quality_id 等）は #334 で UI 化されるが、型としては併せて受け入れられるよう用意する。
 */
export interface PlateAppearanceV2Input {
  game_result_id: number;
  batter_box_number: number;
  plate_result_id: number;
  out_type?: OutType | null;
  hit_type?: HitType | null;
  hit_direction_id?: number | null;
  hit_depth_id?: number | null;
  hit_location_x?: number | null;
  hit_location_y?: number | null;
  rbi?: number | null;
  run_scored?: number | null;
  stolen_bases?: number | null;
  caught_stealing?: number | null;
  final_balls?: number | null;
  final_strikes?: number | null;
  final_outs?: number | null;
  first_pitch_swing?: boolean | null;
  runners_state?: RunnersState | null;
  inning?: number | null;
  contact_quality_id?: number | null;
  timing_id?: number | null;
  pitch_type_id?: number | null;
  self_analysis_memo?: string | null;
  opponent_memo?: string | null;
  pitcher_id?: number | null;
  appearance_situation_id?: number | null;
}

/**
 * POST/PATCH /api/v2/plate_appearances のリクエスト本体型。
 * 新規作成・部分更新の両方で同じ形を使う（PATCH 時もネストキーは `plate_appearance`）。
 */
export interface PlateAppearanceV2Payload {
  plate_appearance: PlateAppearanceV2Input;
}

export interface PlateAppearanceListResponse {
  plate_appearances: PlateAppearanceV2[];
}
