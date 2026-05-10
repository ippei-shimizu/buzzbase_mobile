/**
 * Snackbar の単体テスト。
 *
 * - show() するとメッセージが表示される
 * - 既定 3 秒経過で自動 hide される（fakeTimers）
 * - durationMs を上書きできる
 * - 既に表示中に show() を呼ぶとメッセージが上書きされる
 */
import { act, render } from "@testing-library/react-native";
import { useSnackbarStore } from "../../../stores/snackbarStore";
import { Snackbar } from "../Snackbar";

beforeEach(() => {
  jest.useFakeTimers();
  // ストアを初期状態に戻す
  useSnackbarStore.setState({
    visible: false,
    type: "info",
    message: "",
    durationMs: 3000,
    nonce: 0,
  });
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("Snackbar", () => {
  it("show() を呼ぶとメッセージが描画される", () => {
    const { queryByText } = render(<Snackbar />);
    expect(queryByText("hello")).toBeNull();

    act(() => {
      useSnackbarStore.getState().show({ type: "error", message: "hello" });
    });

    expect(queryByText("hello")).not.toBeNull();
  });

  it("durationMs 経過で自動的に hide される", () => {
    const { queryByText } = render(<Snackbar />);

    act(() => {
      useSnackbarStore
        .getState()
        .show({ message: "auto-hide", durationMs: 1500 });
    });
    expect(queryByText("auto-hide")).not.toBeNull();
    expect(useSnackbarStore.getState().visible).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(useSnackbarStore.getState().visible).toBe(false);
  });

  it("表示中に再度 show() を呼ぶとメッセージが上書きされる", () => {
    const { queryByText } = render(<Snackbar />);

    act(() => {
      useSnackbarStore.getState().show({ message: "first" });
    });
    expect(queryByText("first")).not.toBeNull();

    act(() => {
      useSnackbarStore.getState().show({ message: "second" });
    });
    expect(queryByText("first")).toBeNull();
    expect(queryByText("second")).not.toBeNull();
  });
});
