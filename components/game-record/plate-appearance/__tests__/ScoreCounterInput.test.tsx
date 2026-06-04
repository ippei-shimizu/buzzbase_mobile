import { fireEvent, render } from "@testing-library/react-native";
import { ScoreCounterInput } from "../ScoreCounterInput";

describe("ScoreCounterInput", () => {
  it("4 つのラベル（打点 / 得点 / 盗塁 / 盗塁死）と現在値を描画する", () => {
    const { getByText, queryAllByDisplayValue } = render(
      <ScoreCounterInput
        rbi={1}
        runScored={0}
        stolenBases={2}
        caughtStealing={0}
        onChange={jest.fn()}
      />,
    );

    expect(getByText("打点")).toBeTruthy();
    expect(getByText("得点")).toBeTruthy();
    expect(getByText("盗塁")).toBeTruthy();
    expect(getByText("盗塁死")).toBeTruthy();
    // それぞれの NumberInput に value が表示されていること
    expect(queryAllByDisplayValue("1")).not.toHaveLength(0);
    expect(queryAllByDisplayValue("2")).not.toHaveLength(0);
    expect(queryAllByDisplayValue("0").length).toBeGreaterThanOrEqual(2);
  });

  it("打点欄に数値を入力すると onChange('rbi', 値) が呼ばれる", () => {
    const onChange = jest.fn();
    const { queryAllByDisplayValue } = render(
      <ScoreCounterInput
        rbi={0}
        runScored={0}
        stolenBases={0}
        caughtStealing={0}
        onChange={onChange}
      />,
    );

    const inputs = queryAllByDisplayValue("0");
    // 4 行のうち先頭が打点（NumberInputRow が ROWS 順に並ぶ）
    fireEvent.changeText(inputs[0], "3");

    expect(onChange).toHaveBeenCalledWith("rbi", 3);
  });

  it("得点欄に数値を入力すると onChange('runScored', 値) が呼ばれる", () => {
    const onChange = jest.fn();
    const { queryAllByDisplayValue } = render(
      <ScoreCounterInput
        rbi={0}
        runScored={0}
        stolenBases={0}
        caughtStealing={0}
        onChange={onChange}
      />,
    );

    const inputs = queryAllByDisplayValue("0");
    fireEvent.changeText(inputs[1], "1");

    expect(onChange).toHaveBeenCalledWith("runScored", 1);
  });
});
