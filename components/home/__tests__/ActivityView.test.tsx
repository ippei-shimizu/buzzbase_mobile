import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { ActivityView } from "../ActivityView";

describe("ActivityView", () => {
  it("活動面の5セクションを表示する", () => {
    const { getByText } = renderWithProviders(<ActivityView />);

    expect(getByText("継続")).toBeTruthy();
    expect(getByText("今日のやること")).toBeTruthy();
    expect(getByText("練習ツール")).toBeTruthy();
    expect(getByText("今日の目標")).toBeTruthy();
    expect(getByText("最近の練習")).toBeTruthy();
  });
});
