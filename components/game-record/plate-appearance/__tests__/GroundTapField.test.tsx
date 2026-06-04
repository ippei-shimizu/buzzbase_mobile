import type { HitDirectionWithZones } from "../../../../types/hitDirection";
import { fireEvent, render } from "@testing-library/react-native";
import { Circle } from "react-native-svg";
import {
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "@constants/groundCanvas";
import { GroundTapField } from "../GroundTapField";

const buildHitDirections = (): HitDirectionWithZones[] => [
  {
    id: 10,
    name: "中",
    zone_polygon: [
      {
        depth_id: 2,
        polygon: [
          { x: 0.4, y: 0.2 },
          { x: 0.6, y: 0.2 },
          { x: 0.6, y: 0.4 },
          { x: 0.4, y: 0.4 },
        ],
      },
    ],
  },
];

describe("GroundTapField", () => {
  it("タップ位置を正規化座標 + ゾーン情報として onTap に通知する", () => {
    const onTap = jest.fn();
    const { getByLabelText } = render(
      <GroundTapField
        hitDirections={buildHitDirections()}
        hitLocation={null}
        onTap={onTap}
      />,
    );

    const tapArea = getByLabelText("グラウンド");
    fireEvent(tapArea, "press", {
      nativeEvent: {
        locationX: GROUND_CANVAS_WIDTH * 0.5,
        locationY: GROUND_CANVAS_HEIGHT * 0.3,
      },
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    const args = onTap.mock.calls[0][0];
    expect(args.x).toBeCloseTo(0.5);
    expect(args.y).toBeCloseTo(0.3);
    expect(args.directionId).toBe(10);
    expect(args.depthId).toBe(2);
  });

  it("どのゾーンにも入らないタップ位置では directionId / depthId が null になる", () => {
    const onTap = jest.fn();
    const { getByLabelText } = render(
      <GroundTapField
        hitDirections={buildHitDirections()}
        hitLocation={null}
        onTap={onTap}
      />,
    );

    fireEvent(getByLabelText("グラウンド"), "press", {
      nativeEvent: {
        locationX: 0,
        locationY: 0,
      },
    });

    const args = onTap.mock.calls[0][0];
    expect(args.directionId).toBeNull();
    expect(args.depthId).toBeNull();
  });

  it("hitLocation が null の場合はタップマーカー（Circle）を描画しない", () => {
    const { UNSAFE_queryAllByType } = render(
      <GroundTapField
        hitDirections={buildHitDirections()}
        hitLocation={null}
        onTap={jest.fn()}
      />,
    );
    //描画上の Circle はマウンド（1 個）のみ
    expect(UNSAFE_queryAllByType(Circle)).toHaveLength(1);
  });

  it("hitLocation が指定されると追加でタップマーカー Circle が 2 つ（外側の薄い円と中身）描画される", () => {
    const { UNSAFE_queryAllByType } = render(
      <GroundTapField
        hitDirections={buildHitDirections()}
        hitLocation={{ x: 0.5, y: 0.3 }}
        onTap={jest.fn()}
      />,
    );
    //マウンド 1 + タップマーカー 2 = 3
    expect(UNSAFE_queryAllByType(Circle)).toHaveLength(3);
  });
});
