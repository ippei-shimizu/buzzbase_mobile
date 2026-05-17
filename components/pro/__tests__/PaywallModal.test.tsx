/**
 * PaywallModal コンポーネントの結合テスト。
 *
 * 方針:
 * - feature ごとのコピー表示と、Pro 加入導線 / 閉じる の挙動を確認する。
 * - expo-router の useRouter のみ jest.mock し、それ以外は実物を使う。
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PaywallModal } from "../PaywallModal";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => mockPush(...args),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("PaywallModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(mockPush).toHaveBeenCalledWith("/(profile)/pro");
  });

  it("「閉じる」ボタンで onClose が呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.press(screen.getByLabelText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
