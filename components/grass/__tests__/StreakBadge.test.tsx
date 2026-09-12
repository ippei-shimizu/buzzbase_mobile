import { render } from "@testing-library/react-native";
import { StreakBadge } from "../StreakBadge";

describe("StreakBadge", () => {
  it("連続日数と最長日数を表示する", () => {
    const { getByText } = render(<StreakBadge current={15} longest={32} />);
    expect(getByText("連続 15日")).toBeTruthy();
    expect(getByText("最長 32日")).toBeTruthy();
  });
});
