import { fireEvent, render } from "@testing-library/react-native";
import { AddPlateAppearanceCard } from "../AddPlateAppearanceCard";

describe("AddPlateAppearanceCard", () => {
  it("第N打席ラベルと「結果を入力」アクションを表示する", () => {
    const { getByText } = render(
      <AddPlateAppearanceCard batterBoxNumber={1} onPress={jest.fn()} />,
    );
    expect(getByText("第1打席")).toBeTruthy();
    expect(getByText("結果を入力")).toBeTruthy();
  });

  it("ボタンをタップすると onPress が呼ばれる", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <AddPlateAppearanceCard batterBoxNumber={2} onPress={onPress} />,
    );
    fireEvent.press(getByRole("button", { name: "第2打席の結果を入力" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
