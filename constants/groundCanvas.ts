/**
 * グラウンドイラスト（打席記録の打球方向タップ用）のキャンバスサイズ。
 * back の `docs/strategy/product/game-record-update-design/03-ground-zones.md` の固定値に揃える。
 *
 * タップ座標は `pixel / canvas` で 0.0〜1.0 の正規化座標に変換し、
 * `plate_appearances.hit_location_x` / `hit_location_y` (decimal(5,4)) で保存する。
 */
export const GROUND_CANVAS_WIDTH = 420;
export const GROUND_CANVAS_HEIGHT = 340;

/**
 * 正規化座標の DB 保存精度（decimal(5,4) = 小数点以下 4 桁）。
 * 送信前に `Number(value.toFixed(NORMALIZED_LOCATION_PRECISION))` で丸める。
 */
export const NORMALIZED_LOCATION_PRECISION = 4;
