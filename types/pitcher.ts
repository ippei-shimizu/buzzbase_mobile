import type {
  ArmAngleMaster,
  PitcherStyleMaster,
  VelocityZoneMaster,
} from "./plateAppearanceMasters";

/** 投手の利き手（バックエンド enum: right / left）。 */
export type ThrowHand = "right" | "left";

/**
 * 相手投手マスタ（ユーザー固有マスタ）。
 * `created_by_user_id` はサーバ側のみで管理し、フロントには返されない。
 */
export interface Pitcher {
  id: number;
  name: string;
  throw_hand: ThrowHand | null;
  team_id: number | null;
  arm_angle: ArmAngleMaster | null;
  velocity_zone: VelocityZoneMaster | null;
  pitcher_style: PitcherStyleMaster | null;
}

/** POST /api/v2/pitchers のリクエスト本体に入る `pitcher` 部分。 */
export interface PitcherInput {
  name: string;
  throw_hand?: ThrowHand | null;
  team_id?: number | null;
  arm_angle_id?: number | null;
  velocity_zone_id?: number | null;
  pitcher_style_id?: number | null;
}

/** GET /api/v2/pitchers のラップ形式（paginated_response）。 */
export interface PitcherListResponse {
  data: Pitcher[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}
