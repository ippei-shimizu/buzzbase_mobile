import type { PlateAppearanceV2 } from "../../../../types/plateAppearance";
import { fireEvent, render } from "@testing-library/react-native";
import { PlateAppearanceCard } from "../PlateAppearanceCard";

const buildPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 1,
  game_result_id: 100,
  user_id: 10,
  batter_box_number: 1,
  batting_result: "中安",
  plate_result_id: 7,
  hit_direction_id: 10,
  batting_position_id: null,
  out_type: null,
  hit_type: "single",
  hit_location_x: "0.5",
  hit_location_y: "0.3",
  rbi: 0,
  run_scored: 0,
  stolen_bases: 0,
  caught_stealing: 0,
  final_balls: null,
  final_strikes: null,
  final_outs: null,
  first_pitch_swing: null,
  runners_state: null,
  inning: null,
  self_analysis_memo: null,
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: true,
  contact_quality: null,
  timing: null,
  pitch_type: null,
  hit_depth: null,
  created_at: "2026-06-04T10:30:00Z",
  updated_at: "2026-06-04T10:30:00Z",
  ...overrides,
});

describe("PlateAppearanceCard", () => {
  it("第N打席と batting_result を表示する", () => {
    const { getByText } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({
          batter_box_number: 2,
          batting_result: "三ゴロ",
        })}
      />,
    );

    expect(getByText("第2打席")).toBeTruthy();
    expect(getByText("三ゴロ")).toBeTruthy();
  });

  it("has_detail_data=false のとき「詳細未入力」バッジを表示する", () => {
    const { getByText } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({ has_detail_data: false })}
      />,
    );
    expect(getByText("詳細未入力")).toBeTruthy();
  });

  it("has_detail_data=true のときバッジを表示しない", () => {
    const { queryByText } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({ has_detail_data: true })}
      />,
    );
    expect(queryByText("詳細未入力")).toBeNull();
  });

  it("rbi > 0 のとき「打点 N」を表示する", () => {
    const { getByText } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({ rbi: 2 })}
      />,
    );
    expect(getByText("打点 2")).toBeTruthy();
  });

  it("rbi = 0 のとき打点行は表示されない", () => {
    const { queryByText } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({ rbi: 0 })}
      />,
    );
    expect(queryByText(/打点/)).toBeNull();
  });

  it("カードタップで onPress が呼ばれる", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <PlateAppearanceCard
        plateAppearance={buildPlateAppearance({
          batter_box_number: 1,
          batting_result: "中安",
        })}
        onPress={onPress}
      />,
    );
    fireEvent.press(getByRole("button", { name: "第1打席 中安" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
