/**
 * 横スワイプタブの振る舞いテスト。
 * 開いていない面を描かないこと、表示中の面だけが読み上げ対象になることを確認する。
 */
import { fireEvent, screen } from "@testing-library/react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { SwipeableTabPages } from "../SwipeableTabPages";

type SampleTab = "first" | "second" | "third";

const TAB_KEYS: SampleTab[] = ["first", "second", "third"];

/** タブバーとページャを持つ最小構成。実画面と同じく親が状態を持つ。 */
function Sample() {
  const [tab, setTab] = useState<SampleTab>("first");

  return (
    <View style={{ flex: 1 }}>
      {TAB_KEYS.map((key) => (
        <TouchableOpacity key={key} onPress={() => setTab(key)}>
          <Text>{`${key}タブ`}</Text>
        </TouchableOpacity>
      ))}
      <SwipeableTabPages
        tabKeys={TAB_KEYS}
        activeKey={tab}
        onChange={setTab}
        renderPage={(key) => <Text>{`${key}の中身`}</Text>}
      />
    </View>
  );
}

describe("SwipeableTabPages", () => {
  it("開いていない面は描かない", () => {
    renderWithProviders(<Sample />);

    expect(screen.getByText("firstの中身")).toBeOnTheScreen();
    expect(screen.queryByText("secondの中身")).toBeNull();
    expect(screen.queryByText("thirdの中身")).toBeNull();
  });

  // 面を跨いで飛ぶときは通過する面もアニメーションで見えるため、間の面も描く。
  it("離れた面へ飛ぶと通過する面も描く", () => {
    renderWithProviders(<Sample />);

    fireEvent.press(screen.getByText("thirdタブ"));

    expect(screen.getByText("thirdの中身")).toBeOnTheScreen();
    expect(screen.getByText("secondの中身", { includeHiddenElements: true }));
  });

  // 同じラベルを持つ面が並ぶと、読み上げで重複して聞こえてしまう。
  it("表示中の面だけを読み上げ対象にする", () => {
    renderWithProviders(<Sample />);

    fireEvent.press(screen.getByText("secondタブ"));

    expect(screen.getByText("secondの中身")).toBeOnTheScreen();
    expect(screen.queryByText("firstの中身")).toBeNull();
  });
});
