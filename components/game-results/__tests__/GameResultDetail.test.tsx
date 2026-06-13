import { fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { buildGameResult } from "../../../__tests__/test-utils/factories/gameResult";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { GameResultDetail } from "../GameResultDetail";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("GameResultDetail", () => {
  it("試合情報（チーム名・スコア・打順守備位置）を表示する", () => {
    const game = buildGameResult({
      match_result: {
        my_team_name: "テストイーグルス",
        opponent_team_name: "テストライオンズ",
        my_team_score: 5,
        opponent_team_score: 3,
        batting_order: "3",
        defensive_position: "8",
      },
    });

    const { getByText } = renderWithProviders(<GameResultDetail game={game} />);

    expect(getByText("テストイーグルス")).toBeTruthy();
    expect(getByText("テストライオンズ")).toBeTruthy();
    expect(getByText("5 - 3")).toBeTruthy();
    expect(getByText("3番  中堅手")).toBeTruthy();
  });

  it("isOwner（onDelete あり）のとき試合削除ボタンを押すと確認 Alert を経由して onDelete が呼ばれる", () => {
    const onDelete = jest.fn();
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const destructive = buttons?.find((b) => b.style === "destructive");
        destructive?.onPress?.();
      });

    const game = buildGameResult();
    const { getByText } = renderWithProviders(
      <GameResultDetail game={game} onDelete={onDelete} />,
    );

    fireEvent.press(getByText("この試合結果を削除"));

    expect(alertSpy).toHaveBeenCalledWith(
      "試合結果の削除",
      expect.any(String),
      expect.any(Array),
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("onDelete 未指定のとき試合削除ボタンは表示されない", () => {
    const game = buildGameResult();
    const { queryByText } = renderWithProviders(
      <GameResultDetail game={game} />,
    );
    expect(queryByText("この試合結果を削除")).toBeNull();
  });
});
