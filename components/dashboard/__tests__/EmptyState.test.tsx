/**
 * EmptyState の振る舞いテスト。
 *
 * action が渡されたときだけ CTA ボタンを描画し、タップで onPress が発火することを
 * 公開 UI（ボタンのラベル）経由で確認する。
 */
import { fireEvent, render } from "@testing-library/react-native";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("action 未指定のときは CTA ボタンを描画しない", () => {
    const { queryByText, getByText } = render(
      <EmptyState title="打撃データがありません" />,
    );

    expect(getByText("打撃データがありません")).toBeTruthy();
    expect(queryByText("初めての試合を記録する")).toBeNull();
  });

  it("action を渡すと CTA ボタンを描画し、タップで onPress が発火する", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        title="試合結果がありません"
        action={{ label: "初めての試合を記録する", onPress }}
      />,
    );

    fireEvent.press(getByText("初めての試合を記録する"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
