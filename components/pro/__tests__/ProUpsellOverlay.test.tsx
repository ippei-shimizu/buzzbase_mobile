import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { ProUpsellOverlay } from "../ProUpsellOverlay";

describe("ProUpsellOverlay", () => {
  it("unlocked のとき children をそのまま表示し、カードは出ない", () => {
    render(
      <ProUpsellOverlay unlocked onPressCta={jest.fn()} title="テスト機能">
        <Text>記録内容</Text>
      </ProUpsellOverlay>,
    );

    expect(screen.getByText("記録内容")).toBeOnTheScreen();
    expect(screen.queryByText("Pro プランを見る")).not.toBeOnTheScreen();
  });

  it("unlocked=false のとき、暗幕とPro訴求カードが表示される", () => {
    const onPressCta = jest.fn();
    render(
      <ProUpsellOverlay
        unlocked={false}
        onPressCta={onPressCta}
        feature="note_tags"
      >
        <Text>記録内容</Text>
      </ProUpsellOverlay>,
    );

    expect(screen.getByText("野球ノートにタグを付けて整理")).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Pro プランを見る"));
    expect(onPressCta).toHaveBeenCalledTimes(1);
  });

  it("onPressCta を渡さないと、カードは出ず暗幕のみになる", () => {
    render(
      <ProUpsellOverlay unlocked={false} feature="note_tags">
        <Text>記録内容</Text>
      </ProUpsellOverlay>,
    );

    expect(
      screen.queryByText("野球ノートにタグを付けて整理"),
    ).not.toBeOnTheScreen();
    expect(screen.queryByText("Pro プランを見る")).not.toBeOnTheScreen();
  });

  it("hideCard=true のとき、onPressCta があってもカードは出ない", () => {
    render(
      <ProUpsellOverlay
        unlocked={false}
        onPressCta={jest.fn()}
        feature="note_tags"
        hideCard
      >
        <Text>記録内容</Text>
      </ProUpsellOverlay>,
    );

    expect(
      screen.queryByText("野球ノートにタグを付けて整理"),
    ).not.toBeOnTheScreen();
  });
});
