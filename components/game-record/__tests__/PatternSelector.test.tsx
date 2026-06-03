/**
 * PatternSelector の振る舞いテスト。
 * 3 ボタン（打撃のみ / 投手のみ / 両方）をタップした時に onSelect が
 * 期待した record pattern キーで呼ばれることを確認する。
 */
import { fireEvent, render } from "@testing-library/react-native";
import { PatternSelector, type RecordPattern } from "../PatternSelector";

describe("PatternSelector", () => {
  it("「打撃結果のみ入力」をタップすると onSelect が 'batting' で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(<PatternSelector onSelect={onSelect} />);

    fireEvent.press(getByRole("button", { name: "打撃結果のみ入力" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("batting" satisfies RecordPattern);
  });

  it("「投手結果のみ入力」をタップすると onSelect が 'pitching' で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(<PatternSelector onSelect={onSelect} />);

    fireEvent.press(getByRole("button", { name: "投手結果のみ入力" }));

    expect(onSelect).toHaveBeenCalledWith("pitching" satisfies RecordPattern);
  });

  it("「打撃・投手記録を入力」をタップすると onSelect が 'both' で呼ばれる", () => {
    const onSelect = jest.fn();
    const { getByRole } = render(<PatternSelector onSelect={onSelect} />);

    fireEvent.press(getByRole("button", { name: "打撃・投手記録を入力" }));

    expect(onSelect).toHaveBeenCalledWith("both" satisfies RecordPattern);
  });
});
