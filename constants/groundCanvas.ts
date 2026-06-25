/**
 * グラウンドイラスト（打席記録の打球方向タップ用）のキャンバスサイズ。
 *
 * タップ座標は `pixel / canvas` で 0.0〜1.0 の正規化座標に変換し、
 * `plate_appearances.hit_location_x` / `hit_location_y` (decimal(5,4)) で保存する。
 *
 * 同じキャンバス / 同じ座標系を打席記録 UI（GroundTapField）と stats の
 * 打球分布図（SprayChart）の双方で共有し、保存した正規化座標と表示上の
 * 球場形状を一致させる。
 */
export const GROUND_CANVAS_WIDTH = 420;
export const GROUND_CANVAS_HEIGHT = 340;

/**
 * 球場形状の pixel 座標（`GROUND_CANVAS_WIDTH/HEIGHT` 基準）。
 * HOME はキャンバス下端付近、外野フェンスは縦長やや浅めの楕円。
 */
export const GROUND_HOME = { x: 210, y: 315 } as const;
export const GROUND_FIRST = { x: 285, y: 240 } as const;
export const GROUND_SECOND = { x: 210, y: 165 } as const;
export const GROUND_THIRD = { x: 135, y: 240 } as const;
export const GROUND_OUTFIELD_RX = 235;
export const GROUND_OUTFIELD_RY = 295;

// HOME を通る ±45° のファウルライン上で外野楕円と交わる点までの距離。
// (x-cx)² / rx² + (y-cy)² / ry² = 1 を y = x の傾きの直線で解いて求める。
const FAUL_LINE_DIST = Math.sqrt(
  (GROUND_OUTFIELD_RX ** 2 * GROUND_OUTFIELD_RY ** 2) /
    (GROUND_OUTFIELD_RX ** 2 + GROUND_OUTFIELD_RY ** 2),
);

/** ファウルライン端点（外野楕円とファウルラインの交点）。 */
export const GROUND_LEFT_END = {
  x: GROUND_HOME.x - FAUL_LINE_DIST,
  y: GROUND_HOME.y - FAUL_LINE_DIST,
} as const;
export const GROUND_RIGHT_END = {
  x: GROUND_HOME.x + FAUL_LINE_DIST,
  y: GROUND_HOME.y - FAUL_LINE_DIST,
} as const;

/**
 * 正規化座標の DB 保存精度（decimal(5,4) = 小数点以下 4 桁）。
 * 送信前に `Number(value.toFixed(NORMALIZED_LOCATION_PRECISION))` で丸める。
 */
export const NORMALIZED_LOCATION_PRECISION = 4;

/**
 * グラウンド SVG 上の打球方向ラベル表示位置（pixel 座標、`GROUND_CANVAS_WIDTH/HEIGHT` 基準）。
 * 内野ダイヤモンドを大きく取り、外野ラベルは円弧の少し内側 + 左中/右中を中央寄りに配置する。
 * key (1〜13) は `plate_appearances.hit_direction_id` と一致させる（1=投 〜 13=右線）。
 */
export const DIRECTION_LABEL_POSITIONS: Record<
  number,
  { x: number; y: number }
> = {
  1: { x: 210, y: 258 },
  2: { x: 210, y: 332 },
  3: { x: 285, y: 240 },
  4: { x: 255, y: 180 },
  5: { x: 135, y: 240 },
  6: { x: 165, y: 180 },
  7: { x: 50, y: 160 },
  8: { x: 100, y: 120 },
  9: { x: 132, y: 65 },
  10: { x: 210, y: 75 },
  11: { x: 280, y: 65 },
  12: { x: 315, y: 115 },
  13: { x: 360, y: 160 },
};

/** hit_direction_id (1〜13) → 日本語短縮ラベル。SVG chip の表示文言として使う。 */
export const DIRECTION_LABELS: Record<number, string> = {
  1: "投",
  2: "捕",
  3: "一",
  4: "二",
  5: "三",
  6: "遊",
  7: "左線",
  8: "左",
  9: "左中",
  10: "中",
  11: "右中",
  12: "右",
  13: "右線",
};
