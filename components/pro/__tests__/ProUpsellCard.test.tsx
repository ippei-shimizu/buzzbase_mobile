import { fireEvent, render, screen } from "@testing-library/react-native";
import { ProUpsellCard } from "../ProUpsellCard";

describe("ProUpsellCard", () => {
  it("feature を渡すと PRO_PAYWALL_COPY から title/benefits を表示する", () => {
    const onPressCta = jest.fn();
    render(<ProUpsellCard feature="note_tags" onPressCta={onPressCta} />);

    expect(screen.getByText("野球ノートにタグを付けて整理")).toBeOnTheScreen();
    expect(
      screen.getByText(/練習の気づきや試合の振り返りをタグで分類/),
    ).toBeOnTheScreen();
  });

  it("feature が無いとき、明示的な title/description を表示する", () => {
    const onPressCta = jest.fn();
    render(
      <ProUpsellCard
        title="方向別の打率"
        description="打球を打った方向ごとの打率をヒートマップで可視化します"
        onPressCta={onPressCta}
      />,
    );

    expect(screen.getByText("方向別の打率")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "打球を打った方向ごとの打率をヒートマップで可視化します",
      ),
    ).toBeOnTheScreen();
  });

  it("benefits があるとき description より優先して表示する", () => {
    const onPressCta = jest.fn();
    render(
      <ProUpsellCard
        title="テスト機能"
        description="単文の説明"
        benefits={["メリット1", "メリット2"]}
        onPressCta={onPressCta}
      />,
    );

    expect(screen.getByText("・メリット1\n・メリット2")).toBeOnTheScreen();
    expect(screen.queryByText("単文の説明")).not.toBeOnTheScreen();
  });

  it("デフォルトのCTA文言は「Pro プランを見る」で、押すと onPressCta が呼ばれる", () => {
    const onPressCta = jest.fn();
    render(<ProUpsellCard title="テスト機能" onPressCta={onPressCta} />);

    const button = screen.getByText("Pro プランを見る");
    fireEvent.press(button);
    expect(onPressCta).toHaveBeenCalledTimes(1);
  });

  it("ctaLabel を渡すとボタン文言を上書きできる", () => {
    render(
      <ProUpsellCard
        title="テスト機能"
        ctaLabel="この機能を使う"
        onPressCta={jest.fn()}
      />,
    );

    expect(screen.getByText("この機能を使う")).toBeOnTheScreen();
  });
});
