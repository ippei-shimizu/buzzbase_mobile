/**
 * PaywallModal コンポーネントの結合テスト。
 *
 * 方針:
 * - feature ごとのコピー表示と、Pro 加入導線 / 閉じる の挙動を確認する。
 * - expo-router は buildExpoRouterMock で生成して __routerSpies からアサートする。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PaywallModal } from "../PaywallModal";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

describe("PaywallModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(getRouterSpies()).forEach((spy) => spy.mockClear());
  });

  it("Pro 機能を渡すと、その機能に対応したコピーが表示される", () => {
    render(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(screen.getByText("シーズンを跨いだ成長を可視化")).toBeOnTheScreen();
  });

  it("別の Pro 機能では別のコピーが表示される", () => {
    render(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="unlimited_practice_menus"
      />,
    );

    expect(screen.getByText("練習メニューを無制限に登録")).toBeOnTheScreen();
  });

  it("isOpen が false のときは表示されない", () => {
    render(
      <PaywallModal
        isOpen={false}
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(
      screen.queryByText("シーズンを跨いだ成長を可視化"),
    ).not.toBeOnTheScreen();
  });

  it("「Pro プランを見る」ボタンで /(profile)/pro へ遷移し onClose も呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.press(screen.getByLabelText("Pro プランを見る"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/pro");
  });

  it("「閉じる」ボタンで onClose が呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.press(screen.getByLabelText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
