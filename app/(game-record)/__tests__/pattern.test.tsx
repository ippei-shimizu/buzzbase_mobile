/**
 * Pattern 分岐画面の振る舞いテスト。
 *
 * - 「打撃のみ」/「両方」を選ぶと Step2 (step2-batting) へ遷移する
 * - 「投手のみ」を選ぶと Step3 (step3-pitching) へ遷移する
 * - 選択した record pattern が Zustand store に保存される
 *
 * 方針:
 * - expo-router のみ jest.mock（環境境界）
 * - Zustand store の内部 state は recordPattern 一点のみ assert（テストの目的）
 */
import { fireEvent } from "@testing-library/react-native";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import PatternScreen from "../pattern";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as {
    __routerSpies: { replace: jest.Mock; push: jest.Mock; back: jest.Mock };
  };
  return m.__routerSpies;
};

beforeEach(() => {
  useGameRecordStore.getState().reset();
  const spies = getRouterSpies();
  spies.replace.mockClear();
  spies.push.mockClear();
  spies.back.mockClear();
});

describe("Pattern 分岐画面", () => {
  it("「打撃結果のみ入力」を選ぶと Step2 へ遷移し recordPattern=batting がセットされる", () => {
    const { getByRole } = renderWithProviders(<PatternScreen />);

    fireEvent.press(getByRole("button", { name: "打撃結果のみ入力" }));

    expect(useGameRecordStore.getState().recordPattern).toBe("batting");
    expect(getRouterSpies().replace).toHaveBeenCalledWith(
      "/(game-record)/step2-batting",
    );
  });

  it("「投手結果のみ入力」を選ぶと Step3 へ遷移し recordPattern=pitching がセットされる", () => {
    const { getByRole } = renderWithProviders(<PatternScreen />);

    fireEvent.press(getByRole("button", { name: "投手結果のみ入力" }));

    expect(useGameRecordStore.getState().recordPattern).toBe("pitching");
    expect(getRouterSpies().replace).toHaveBeenCalledWith(
      "/(game-record)/step3-pitching",
    );
  });

  it("「打撃・投手記録を入力」を選ぶと Step2 へ遷移し recordPattern=both がセットされる", () => {
    const { getByRole } = renderWithProviders(<PatternScreen />);

    fireEvent.press(getByRole("button", { name: "打撃・投手記録を入力" }));

    expect(useGameRecordStore.getState().recordPattern).toBe("both");
    expect(getRouterSpies().replace).toHaveBeenCalledWith(
      "/(game-record)/step2-batting",
    );
  });
});
