import type { HitDirectionWithZones } from "../../types/hitDirection";
import { detectZone, isPointInPolygon } from "../groundZoneDetector";

/**
 * テスト用に内野方向（投・中央矩形）と外野方向（中・3 層）を含む fixture を構築する。
 * 03-ground-zones.md の正規化座標スケール (0〜1) で簡略化したゾーンを使い、
 * Point-in-Polygon と detectZone の振る舞いを担保する。
 */
const buildHitDirections = (): HitDirectionWithZones[] => [
  {
    id: 1,
    name: "投",
    zone_polygon: {
      depth_id: null,
      polygon: [
        { x: 0.45, y: 0.7 },
        { x: 0.55, y: 0.7 },
        { x: 0.55, y: 0.85 },
        { x: 0.45, y: 0.85 },
      ],
    },
  },
  {
    id: 6,
    name: "遊",
    zone_polygon: {
      depth_id: null,
      polygon: [
        { x: 0.3, y: 0.55 },
        { x: 0.45, y: 0.55 },
        { x: 0.45, y: 0.7 },
        { x: 0.3, y: 0.7 },
      ],
    },
  },
  {
    id: 10,
    name: "中",
    zone_polygon: [
      {
        depth_id: 1,
        polygon: [
          { x: 0.4, y: 0.35 },
          { x: 0.6, y: 0.35 },
          { x: 0.6, y: 0.5 },
          { x: 0.4, y: 0.5 },
        ],
      },
      {
        depth_id: 2,
        polygon: [
          { x: 0.4, y: 0.2 },
          { x: 0.6, y: 0.2 },
          { x: 0.6, y: 0.35 },
          { x: 0.4, y: 0.35 },
        ],
      },
      {
        depth_id: 3,
        polygon: [
          { x: 0.4, y: 0.05 },
          { x: 0.6, y: 0.05 },
          { x: 0.6, y: 0.2 },
          { x: 0.4, y: 0.2 },
        ],
      },
    ],
  },
];

describe("isPointInPolygon", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  it("矩形の中心が内側と判定される", () => {
    expect(isPointInPolygon({ x: 0.5, y: 0.5 }, square)).toBe(true);
  });

  it("矩形の外側の点は false を返す", () => {
    expect(isPointInPolygon({ x: 1.5, y: 0.5 }, square)).toBe(false);
    expect(isPointInPolygon({ x: -0.1, y: 0.5 }, square)).toBe(false);
  });

  it("凹多角形（L 字）の凹みに入った点は外側と判定される", () => {
    const lShape = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ];
    expect(isPointInPolygon({ x: 1.5, y: 1.5 }, lShape)).toBe(false);
    expect(isPointInPolygon({ x: 0.5, y: 1.5 }, lShape)).toBe(true);
  });
});

describe("detectZone", () => {
  const hitDirections = buildHitDirections();

  it("内野（投）のゾーン中央をタップすると direction=1, depth=null を返す", () => {
    expect(detectZone({ x: 0.5, y: 0.78 }, hitDirections)).toEqual({
      direction_id: 1,
      depth_id: null,
    });
  });

  it("内野（遊）のゾーン中央をタップすると direction=6, depth=null を返す", () => {
    expect(detectZone({ x: 0.38, y: 0.6 }, hitDirections)).toEqual({
      direction_id: 6,
      depth_id: null,
    });
  });

  it("外野（中・内野超え）をタップすると direction=10, depth=1 を返す", () => {
    expect(detectZone({ x: 0.5, y: 0.42 }, hitDirections)).toEqual({
      direction_id: 10,
      depth_id: 1,
    });
  });

  it("外野（中・外野）をタップすると direction=10, depth=2 を返す", () => {
    expect(detectZone({ x: 0.5, y: 0.27 }, hitDirections)).toEqual({
      direction_id: 10,
      depth_id: 2,
    });
  });

  it("外野（中・フェンス際）をタップすると direction=10, depth=3 を返す", () => {
    expect(detectZone({ x: 0.5, y: 0.1 }, hitDirections)).toEqual({
      direction_id: 10,
      depth_id: 3,
    });
  });

  it("どのゾーンにも入らないファウル領域は null を返す", () => {
    expect(detectZone({ x: 0.05, y: 0.05 }, hitDirections)).toBeNull();
    expect(detectZone({ x: 0.95, y: 0.95 }, hitDirections)).toBeNull();
  });

  it("zone_polygon が null の方向はスキップして他のゾーンを探す", () => {
    const withNull: HitDirectionWithZones[] = [
      { id: 99, name: "未設定", zone_polygon: null },
      ...hitDirections,
    ];
    expect(detectZone({ x: 0.5, y: 0.78 }, withNull)).toEqual({
      direction_id: 1,
      depth_id: null,
    });
  });
});
