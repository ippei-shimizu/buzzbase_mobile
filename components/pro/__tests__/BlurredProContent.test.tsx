import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { BlurredProContent } from "../BlurredProContent";

describe("BlurredProContent", () => {
  it("unlocked のとき children がそのまま表示される", () => {
    render(
      <BlurredProContent unlocked>
        <Text>記録内容</Text>
      </BlurredProContent>,
    );

    expect(screen.getByText("記録内容")).toBeOnTheScreen();
    expect(screen.queryByText("Pro プラン限定")).not.toBeOnTheScreen();
  });

  it("unlocked=false のときバッジが表示される", () => {
    render(
      <BlurredProContent unlocked={false}>
        <Text>記録内容</Text>
      </BlurredProContent>,
    );

    expect(screen.getByText("Pro プラン限定")).toBeOnTheScreen();
  });

  it("badgeLabel を渡すとその文言が表示される", () => {
    render(
      <BlurredProContent unlocked={false} badgeLabel="Pro で見られます">
        <Text>記録内容</Text>
      </BlurredProContent>,
    );

    expect(screen.getByText("Pro で見られます")).toBeOnTheScreen();
  });

  it("onPressBadge を渡すとタップでハンドラが呼ばれる", () => {
    const onPressBadge = jest.fn();
    render(
      <BlurredProContent unlocked={false} onPressBadge={onPressBadge}>
        <Text>記録内容</Text>
      </BlurredProContent>,
    );

    fireEvent.press(screen.getByRole("button"));
    expect(onPressBadge).toHaveBeenCalledTimes(1);
  });

  it("title/description を渡すと Pro で何ができるかの訴求コピーが表示される", () => {
    render(
      <BlurredProContent
        unlocked={false}
        title="コンディションを詳しく記録"
        description="体調・気分・睡眠などを細かく記録できます"
      >
        <Text>記録内容</Text>
      </BlurredProContent>,
    );

    expect(screen.getByText("コンディションを詳しく記録")).toBeOnTheScreen();
    expect(
      screen.getByText("体調・気分・睡眠などを細かく記録できます"),
    ).toBeOnTheScreen();
  });
});
