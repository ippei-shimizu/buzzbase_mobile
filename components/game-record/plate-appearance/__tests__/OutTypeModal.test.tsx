import { fireEvent, render } from "@testing-library/react-native";
import { PLATE_RESULT_IDS } from "@constants/plateResults";
import { OutTypeModal } from "../OutTypeModal";

describe("OutTypeModal", () => {
  it("visible=true で各サブ種別ボタンを描画する", () => {
    const { getByRole } = render(
      <OutTypeModal visible onSelect={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(getByRole("button", { name: "ゴロ" })).toBeTruthy();
    expect(getByRole("button", { name: "フライ" })).toBeTruthy();
    expect(getByRole("button", { name: "ライナー" })).toBeTruthy();
    expect(getByRole("button", { name: "併殺打" })).toBeTruthy();
    expect(getByRole("button", { name: "ファールフライ" })).toBeTruthy();
  });

  it("「ゴロ」タップで onSelect が ground_ball オプション（plate_result_id=1）で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(
      <OutTypeModal visible onSelect={onSelect} onCancel={jest.fn()} />,
    );

    fireEvent.press(getByRole("button", { name: "ゴロ" }));

    expect(onSelect).toHaveBeenCalledWith({
      label: "ゴロ",
      plate_result_id: PLATE_RESULT_IDS.GROUND_OUT,
      out_type: "ground_ball",
    });
  });

  it("「併殺打」タップで onSelect が double_play オプション（plate_result_id=19）で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(
      <OutTypeModal visible onSelect={onSelect} onCancel={jest.fn()} />,
    );

    fireEvent.press(getByRole("button", { name: "併殺打" }));

    expect(onSelect).toHaveBeenCalledWith({
      label: "併殺打",
      plate_result_id: PLATE_RESULT_IDS.DOUBLE_PLAY,
      out_type: "double_play",
    });
  });

  it("キャンセルボタンで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    const { getByRole } = render(
      <OutTypeModal visible onSelect={jest.fn()} onCancel={onCancel} />,
    );

    fireEvent.press(getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
