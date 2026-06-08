import type {
  HitDirectionWithZones,
  Point,
  Polygon,
} from "../types/hitDirection";
import {
  DIRECTION_LABEL_POSITIONS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "@constants/groundCanvas";

/**
 * タップ位置（正規化座標）に最も近い `DIRECTION_LABEL_POSITIONS` のラベル ID を返す。
 * `hit_directions` マスタの `zone_polygon` に依存せず、画面上のラベル chip の
 * pixel 座標と距離比較するだけなので、ラベル位置と完全に連動する。
 *
 * `hit_depth_id` は本関数では判定できないため、呼び出し側で別途扱う（本 PR では null 固定）。
 *
 * @param point タップ位置の正規化座標 (x: 0..1, y: 0..1)
 * @returns 最寄りラベルの id。`DIRECTION_LABEL_POSITIONS` が空のときのみ null
 */
export function detectClosestDirection(point: Point): number | null {
  const pixelX = point.x * GROUND_CANVAS_WIDTH;
  const pixelY = point.y * GROUND_CANVAS_HEIGHT;
  let closestId: number | null = null;
  let closestDistSq = Infinity;
  for (const [idKey, pos] of Object.entries(DIRECTION_LABEL_POSITIONS)) {
    const dx = pos.x - pixelX;
    const dy = pos.y - pixelY;
    const distSq = dx * dx + dy * dy;
    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      closestId = Number(idKey);
    }
  }
  return closestId;
}

/**
 * 点が多角形内部に含まれるかを Ray-casting アルゴリズムで判定する。
 *
 * 凸／凹のいずれの多角形でも動作する。境界線上の点は実装の浮動小数誤差により
 * true/false どちらにも倒れ得るため、境界に乗ったゾーンは「最初にマッチしたゾーン」優先で扱う。
 *
 * @param point 判定対象点（正規化座標 0〜1）
 * @param polygon 多角形を構成する頂点列
 * @returns 内部に含まれる場合は true
 */
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface ZoneHit {
  direction_id: number;
  depth_id: number | null;
}

/**
 * タップ座標 (0.0〜1.0) から `hit_direction_id` と `hit_depth_id` を判定する。
 *
 * - 内野方向 (投/捕/一/二/三/遊): zone_polygon は単一オブジェクト、depth_id は常に null
 * - 外野方向 (左線/左/左中/中/右中/右/右線): zone_polygon は深さ別の配列、内側からヒット判定
 *
 * いずれのゾーンにも含まれない（ファウル領域・座標範囲外など）場合は null を返し、
 * `hit_direction_id` も `hit_depth_id` も付けずに保存する。
 *
 * @param point タップ位置の正規化座標
 * @param hitDirections `/api/v2/hit_directions` から取得したマスタ
 * @returns ゾーン特定できた場合は `{ direction_id, depth_id }`、不能なら null
 */
export function detectZone(
  point: Point,
  hitDirections: HitDirectionWithZones[],
): ZoneHit | null {
  for (const direction of hitDirections) {
    const zonePolygon = direction.zone_polygon;
    if (!zonePolygon) continue;

    if (Array.isArray(zonePolygon)) {
      for (const layer of zonePolygon) {
        if (isPointInPolygon(point, layer.polygon)) {
          return { direction_id: direction.id, depth_id: layer.depth_id };
        }
      }
    } else {
      if (isPointInPolygon(point, zonePolygon.polygon)) {
        return { direction_id: direction.id, depth_id: null };
      }
    }
  }
  return null;
}
