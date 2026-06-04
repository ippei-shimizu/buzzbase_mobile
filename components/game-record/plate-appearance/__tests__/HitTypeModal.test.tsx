import { fireEvent, render } from "@testing-library/react-native";
import { PLATE_RESULT_IDS } from "@constants/plateResults";
import { HitTypeModal } from "../HitTypeModal";

describe("HitTypeModal", () => {
  it("visible=true で各サブ種別ボタンを描画する", () => {
    const { getByRole } = render(
      <HitTypeModal visible onSelect={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(getByRole("button", { name: "単打" })).toBeTruthy();
    expect(getByRole("button", { name: "二塁打" })).toBeTruthy();
    expect(getByRole("button", { name: "三塁打" })).toBeTruthy();
    expect(getByRole("button", { name: "本塁打" })).toBeTruthy();
  });

  it("「単打」タップで onSelect が single オプション（plate_result_id=7）で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(
      <HitTypeModal visible onSelect={onSelect} onCancel={jest.fn()} />,
    );

    fireEvent.press(getByRole("button", { name: "単打" }));

    expect(onSelect).toHaveBeenCalledWith({
      label: "単打",
      plate_result_id: PLATE_RESULT_IDS.SINGLE,
      hit_type: "single",
    });
  });

  it("「本塁打」タップで onSelect が home_run オプション（plate_result_id=10）で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(
      <HitTypeModal visible onSelect={onSelect} onCancel={jest.fn()} />,
    );

    fireEvent.press(getByRole("button", { name: "本塁打" }));

    expect(onSelect).toHaveBeenCalledWith({
      label: "本塁打",
      plate_result_id: PLATE_RESULT_IDS.HOME_RUN,
      hit_type: "home_run",
    });
  });

  it("キャンセルボタンで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    const { getByRole } = render(
      <HitTypeModal visible onSelect={jest.fn()} onCancel={onCancel} />,
    );

    fireEvent.press(getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
