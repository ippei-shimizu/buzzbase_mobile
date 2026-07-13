/**
 * GlobalMenuOverlay の振る舞いテスト。
 *
 * 方針:
 * - expo-router の useRouter() のみ jest.mock（環境境界）。
 * - メニュー項目タップで適切なルートへ router.push が呼ばれることを assert する。
 * - メニュー外（オーバーレイ）タップで onClose が呼ばれることを検証する。
 */
import type { RouterSpies } from "../../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { GlobalMenuOverlay } from "../GlobalMenuOverlay";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// useHeaderHeight() は NavigationContainer 配下で動作するため、テスト環境では固定値を返す
jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 100,
}));

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

describe("GlobalMenuOverlay", () => {
  beforeEach(() => {
    const spies = getRouterSpies();
    Object.values(spies).forEach((fn) => fn.mockClear());
  });

  it("visible=false のときは何も描画しない", () => {
    const { queryByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible={false}
        opacity={new Animated.Value(0)}
        onClose={jest.fn()}
      />,
    );
    expect(queryByText("野球ノート")).toBeNull();
    expect(queryByText("シーズン管理")).toBeNull();
    expect(queryByText("設定")).toBeNull();
  });

  it("visible=true のときは4項目を描画する", () => {
    const { getByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible
        opacity={new Animated.Value(1)}
        onClose={jest.fn()}
      />,
    );
    expect(getByText("練習記録")).toBeTruthy();
    expect(getByText("野球ノート")).toBeTruthy();
    expect(getByText("シーズン管理")).toBeTruthy();
    expect(getByText("設定")).toBeTruthy();
  });

  it("「練習記録」をタップすると記録一覧の練習タブへ遷移する", () => {
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible
        opacity={new Animated.Value(1)}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByText("練習記録"));
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(records)/list?tab=practice",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("「野球ノート」をタップすると記録一覧のノートタブへ遷移し、onClose も呼ばれる", () => {
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible
        opacity={new Animated.Value(1)}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByText("野球ノート"));
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(records)/list?tab=note",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("「シーズン管理」をタップすると seasons 画面へ遷移する", () => {
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible
        opacity={new Animated.Value(1)}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByText("シーズン管理"));
    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/seasons");
    expect(onClose).toHaveBeenCalled();
  });

  it("「設定」をタップすると settings 画面へ遷移する", () => {
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <GlobalMenuOverlay
        visible
        opacity={new Animated.Value(1)}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByText("設定"));
    expect(getRouterSpies().push).toHaveBeenCalledWith("/settings");
    expect(onClose).toHaveBeenCalled();
  });
});
