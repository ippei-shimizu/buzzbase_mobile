import {
  DIRECTION_LABEL_POSITIONS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "../../constants/groundCanvas";
import { detectClosestDirection } from "../groundZoneDetector";

/** pixel 座標 → 正規化座標 (0..1) に変換するテスト用ヘルパ。 */
const toNormalized = (pixel: { x: number; y: number }) => ({
  x: pixel.x / GROUND_CANVAS_WIDTH,
  y: pixel.y / GROUND_CANVAS_HEIGHT,
});

describe("detectClosestDirection", () => {
  it("ラベル位置自体をタップすると同じ id を返す", () => {
    for (const [idKey, pos] of Object.entries(DIRECTION_LABEL_POSITIONS)) {
      expect(detectClosestDirection(toNormalized(pos))).toBe(Number(idKey));
    }
  });

  it("ラベル位置のごく近傍は同じ id を返す", () => {
    const pitcherPos = DIRECTION_LABEL_POSITIONS[1];
    expect(
      detectClosestDirection(
        toNormalized({ x: pitcherPos.x + 3, y: pitcherPos.y - 3 }),
      ),
    ).toBe(1);
  });

  it("外野方向（中）の近傍をタップすると id=10 を返す", () => {
    const centerPos = DIRECTION_LABEL_POSITIONS[10];
    expect(detectClosestDirection(toNormalized(centerPos))).toBe(10);
  });

  it("キャンバス左下端近くは捕(2) または三(5) のいずれか、距離の近い方が返る", () => {
    const result = detectClosestDirection({ x: 0.1, y: 0.95 });
    expect([2, 5]).toContain(result);
  });
});
