/**
 * v2 打席記録ステップ式 UI で使う plate_result マスタの分類。
 *
 * back の `db/data/master_seeds/plate_results.yml` (id 1-19) と完全に一致させる。
 * id を変更すると既存 plate_appearances の意味が壊れるため、サーバー側のシードに揃えて固定する。
 *
 * - `hit_direction_required = false` の結果は「グラウンドタップ不要」グループ（三振 / 四球 / 死球 / 打撃妨害 / 振り逃げ）
 * - `hit_direction_required = true` の結果はタップ必要グループ（アウト系 / ヒット系 / 失策 / FC / 犠打 / 犠飛）
 *
 * 「アウト」「ヒット」はそれぞれサブ選択モーダル経由で `plate_result_id` をサブ種別 ID に確定する。
 *   - アウト: ゴロ=1 / フライ=2 / ファールフライ=3 / ライナー=4 / 併殺打=19 と `out_type` を併送
 *   - ヒット: 単打=7 / 二塁打=8 / 三塁打=9 / 本塁打=10 と `hit_type` を併送
 *
 * 走塁妨害 (id=18) は新仕様の UI では非表示（既存データのみ残す）。
 */

import type { HitType, OutType } from "../types/plateAppearance";

export const PLATE_RESULT_IDS = {
  GROUND_OUT: 1,
  FLY_OUT: 2,
  FOUL_FLY: 3,
  LINE_OUT: 4,
  ERROR: 5,
  FIELDERS_CHOICE: 6,
  SINGLE: 7,
  DOUBLE: 8,
  TRIPLE: 9,
  HOME_RUN: 10,
  SACRIFICE_HIT: 11,
  SACRIFICE_FLY: 12,
  STRIKEOUT: 13,
  STRIKEOUT_REACHED: 14,
  WALK: 15,
  HIT_BY_PITCH: 16,
  INTERFERENCE: 17,
  OBSTRUCTION: 18,
  DOUBLE_PLAY: 19,
} as const;

export type PlateResultId =
  (typeof PLATE_RESULT_IDS)[keyof typeof PLATE_RESULT_IDS];

/** タップ不要のボタン（打球方向を伴わない結果）。 */
export interface NoDirectionOption {
  label: string;
  plate_result_id: PlateResultId;
}

// TODO: 空振り三振と見逃し三振の API 上の区別を導入する。
// 現状は plate_results マスタが両者を同一 id (=13) で持つため、ボタンを分けても
// 保存値が同一になり、分析（見逃し率など）で振り分けられない。バックエンドに
// swing_type 相当のカラムが追加されたら、この配列と PlateAppearanceV2Input を更新する。
export const NO_DIRECTION_RESULT_OPTIONS: readonly NoDirectionOption[] = [
  { label: "空振り三振", plate_result_id: PLATE_RESULT_IDS.STRIKEOUT },
  { label: "見逃し三振", plate_result_id: PLATE_RESULT_IDS.STRIKEOUT },
  { label: "振り逃げ", plate_result_id: PLATE_RESULT_IDS.STRIKEOUT_REACHED },
  { label: "四球", plate_result_id: PLATE_RESULT_IDS.WALK },
  { label: "死球", plate_result_id: PLATE_RESULT_IDS.HIT_BY_PITCH },
  { label: "打撃妨害", plate_result_id: PLATE_RESULT_IDS.INTERFERENCE },
] as const;

/** アウト種別サブ選択。`plate_result_id` と `out_type` を併送する。 */
export interface OutTypeOption {
  label: string;
  plate_result_id: PlateResultId;
  out_type: OutType;
}

export const OUT_TYPE_OPTIONS: readonly OutTypeOption[] = [
  {
    label: "ゴロ",
    plate_result_id: PLATE_RESULT_IDS.GROUND_OUT,
    out_type: "ground_out",
  },
  {
    label: "フライ",
    plate_result_id: PLATE_RESULT_IDS.FLY_OUT,
    out_type: "fly_out",
  },
  {
    label: "ライナー",
    plate_result_id: PLATE_RESULT_IDS.LINE_OUT,
    out_type: "line_out",
  },
  {
    label: "併殺打",
    plate_result_id: PLATE_RESULT_IDS.DOUBLE_PLAY,
    out_type: "double_play",
  },
  {
    label: "ファールフライ",
    plate_result_id: PLATE_RESULT_IDS.FOUL_FLY,
    out_type: "foul_fly",
  },
] as const;

/** ヒット種別サブ選択。`plate_result_id` と `hit_type` を併送する。 */
export interface HitTypeOption {
  label: string;
  plate_result_id: PlateResultId;
  hit_type: HitType;
}

export const HIT_TYPE_OPTIONS: readonly HitTypeOption[] = [
  {
    label: "単打",
    plate_result_id: PLATE_RESULT_IDS.SINGLE,
    hit_type: "single",
  },
  {
    label: "二塁打",
    plate_result_id: PLATE_RESULT_IDS.DOUBLE,
    hit_type: "double",
  },
  {
    label: "三塁打",
    plate_result_id: PLATE_RESULT_IDS.TRIPLE,
    hit_type: "triple",
  },
  {
    label: "本塁打",
    plate_result_id: PLATE_RESULT_IDS.HOME_RUN,
    hit_type: "home_run",
  },
] as const;

/**
 * タップ必要グループのうち、サブ選択モーダルを経由せず直接送る単発ボタン。
 */
export interface DirectionOnlyOption {
  label: string;
  plate_result_id: PlateResultId;
}

export const DIRECTION_ONLY_RESULT_OPTIONS: readonly DirectionOnlyOption[] = [
  { label: "失策", plate_result_id: PLATE_RESULT_IDS.ERROR },
  { label: "野選", plate_result_id: PLATE_RESULT_IDS.FIELDERS_CHOICE },
  { label: "犠打", plate_result_id: PLATE_RESULT_IDS.SACRIFICE_HIT },
  { label: "犠飛", plate_result_id: PLATE_RESULT_IDS.SACRIFICE_FLY },
] as const;
