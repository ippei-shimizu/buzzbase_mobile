/**
 * グラウンド上の打球方向（13方向）とそのゾーン定義の型。
 * back の `app/serializers/v2/hit_direction_serializer.rb` のレスポンス形に揃える。
 *
 * 内野方向（投/捕/一/二/三/遊）は深さなしの単一ポリゴン、
 * 外野方向（左線/左/左中/中/右中/右/右線）は深さ別の複数ポリゴン配列で返る。
 */

export interface Point {
  x: number;
  y: number;
}

export type Polygon = Point[];

/** 内野方向の zone_polygon（depth_id は常に null）。 */
export interface InfieldZone {
  depth_id: null;
  polygon: Polygon;
}

/** 外野方向の zone_polygon（深さ 1/2/3 のいずれか）。 */
export interface OutfieldZoneLayer {
  depth_id: number;
  polygon: Polygon;
}

/**
 * back から返る zone_polygon の形。
 * - 内野: 単一の InfieldZone（オブジェクト）
 * - 外野: OutfieldZoneLayer の配列
 */
export type HitDirectionZonePolygon = InfieldZone | OutfieldZoneLayer[];

export interface HitDirectionWithZones {
  id: number;
  name: string;
  zone_polygon: HitDirectionZonePolygon | null;
}

export interface HitDirectionListResponse {
  hit_directions: HitDirectionWithZones[];
}
