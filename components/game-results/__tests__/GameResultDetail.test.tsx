import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import { fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { buildGameResult } from "../../../__tests__/test-utils/factories/gameResult";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { GameResultDetail } from "../GameResultDetail";

const buildPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 1,
  game_result_id: 100,
  user_id: 10,
  batter_box_number: 1,
  batting_result: "中安",
  plate_result_id: 7,
  hit_direction_id: 10,
  batting_position_id: null,
  out_type: null,
  hit_type: "single",
  swing_type: null,
  hit_location_x: "0.5",
  hit_location_y: "0.3",
  rbi: 0,
  run_scored: 0,
  stolen_bases: 0,
  caught_stealing: 0,
  final_balls: null,
  final_strikes: null,
  final_outs: null,
  first_pitch_swing: null,
  runners_state: null,
  inning: null,
  self_analysis_memo: null,
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: true,
  contact_quality: null,
  timing: null,
  pitch_type: null,
  pitcher: null,
  appearance_situation: null,
  created_at: "2026-06-04T10:30:00Z",
  updated_at: "2026-06-04T10:30:00Z",
  ...overrides,
});

const stubByGame = (
  gameResultId: number,
  plateAppearances: PlateAppearanceV2[],
) => {
  server.use(
    http.get(baseUrl(`/api/v2/plate_appearances/by_game/${gameResultId}`), () =>
      HttpResponse.json({ plate_appearances: plateAppearances }),
    ),
  );
};

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

  it("打席リストを batter_box_number 昇順で読み取り専用カードとして並べる", async () => {
    const game = buildGameResult({ game_result_id: 500 });
    stubByGame(500, [
      buildPlateAppearance({
        id: 2,
        batter_box_number: 2,
        batting_result: "三ゴロ",
      }),
      buildPlateAppearance({
        id: 1,
        batter_box_number: 1,
        batting_result: "中安",
      }),
    ]);

    const { findAllByLabelText } = renderWithProviders(
      <GameResultDetail game={game} />,
    );

    const cards = await findAllByLabelText(/^第\d打席 /);
    expect(cards.map((card) => card.props.accessibilityLabel)).toEqual([
      "第1打席 中安",
      "第2打席 三ゴロ",
    ]);
  });

  it("試合詳細の打席カードは読み取り専用（タップしてもルーター遷移しない、accessibilityRole=button が無い）", async () => {
    const game = buildGameResult({ game_result_id: 501 });
    stubByGame(501, [
      buildPlateAppearance({
        id: 9,
        batter_box_number: 1,
        batting_result: "中安",
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { __routerSpies } = require("expo-router") as {
      __routerSpies: { push: jest.Mock };
    };
    __routerSpies.push.mockReset();

    const { findByLabelText, queryByRole } = renderWithProviders(
      <GameResultDetail game={game} onDelete={() => {}} />,
    );
    const card = await findByLabelText("第1打席 中安");
    fireEvent.press(card);
    fireEvent(card, "longPress");

    expect(__routerSpies.push).not.toHaveBeenCalled();
    expect(queryByRole("button", { name: "第1打席 中安" })).toBeNull();
  });
});
