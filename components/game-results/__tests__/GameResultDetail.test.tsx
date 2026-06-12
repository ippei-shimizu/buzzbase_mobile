import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import type { AlertButton } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
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

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as {
    __routerSpies: {
      push: jest.Mock;
      back: jest.Mock;
    };
  };
  return m.__routerSpies;
};

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

const pickDestructive = (buttons?: AlertButton[]): AlertButton | undefined =>
  buttons?.find((button) => button.style === "destructive");

beforeEach(() => {
  jest.restoreAllMocks();
  getRouterSpies().push.mockReset();
  getRouterSpies().back.mockReset();
});

describe("GameResultDetail 打席リスト", () => {
  it("batter_box_number 昇順で打席カードを並べる", async () => {
    const game = buildGameResult({ game_result_id: 100 });
    stubByGame(100, [
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
      <GameResultDetail game={game} onDelete={() => {}} />,
    );

    const cards = await findAllByLabelText(/^第\d打席 /);
    expect(cards.map((card) => card.props.accessibilityLabel)).toEqual([
      "第1打席 中安",
      "第2打席 三ゴロ",
    ]);
  });

  it("has_detail_data=false の打席に「詳細未入力」バッジが出る", async () => {
    const game = buildGameResult({ game_result_id: 101 });
    stubByGame(101, [buildPlateAppearance({ id: 1, has_detail_data: false })]);

    const { findByText } = renderWithProviders(
      <GameResultDetail game={game} onDelete={() => {}} />,
    );

    expect(await findByText("詳細未入力")).toBeTruthy();
  });

  it("isOwner（onDelete あり）の場合、カードタップで編集ルートに gameResultId 付きで push する", async () => {
    const game = buildGameResult({ game_result_id: 200 });
    stubByGame(200, [
      buildPlateAppearance({
        id: 42,
        batter_box_number: 1,
        batting_result: "中安",
      }),
    ]);

    const { findByRole } = renderWithProviders(
      <GameResultDetail game={game} onDelete={() => {}} />,
    );

    const card = await findByRole("button", { name: "第1打席 中安" });
    fireEvent.press(card);

    const { push } = getRouterSpies();
    expect(push).toHaveBeenCalledWith({
      pathname: "/(game-record)/plate-appearances/[id]/edit",
      params: { id: "42", gameResultId: "200" },
    });
  });

  it("isOwner ではない（onDelete 未指定）場合、カードをタップしても push されない", async () => {
    const game = buildGameResult({ game_result_id: 201 });
    stubByGame(201, [
      buildPlateAppearance({
        id: 9,
        batter_box_number: 1,
        batting_result: "中安",
      }),
    ]);

    const { findByRole } = renderWithProviders(
      <GameResultDetail game={game} />,
    );

    const card = await findByRole("button", { name: "第1打席 中安" });
    fireEvent.press(card);

    expect(getRouterSpies().push).not.toHaveBeenCalled();
  });

  it("isOwner の場合、カード長押し→Alert 削除確定で DELETE /api/v2/plate_appearances/:id が叩かれる", async () => {
    const game = buildGameResult({ game_result_id: 300 });
    stubByGame(300, [
      buildPlateAppearance({
        id: 77,
        batter_box_number: 1,
        batting_result: "中安",
      }),
    ]);

    let deletedId: string | null = null;
    server.use(
      http.delete(baseUrl("/api/v2/plate_appearances/:id"), ({ params }) => {
        deletedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        pickDestructive(buttons)?.onPress?.();
      });

    const { findByRole } = renderWithProviders(
      <GameResultDetail game={game} onDelete={() => {}} />,
    );

    const card = await findByRole("button", { name: "第1打席 中安" });
    fireEvent(card, "longPress");

    await waitFor(() => expect(deletedId).toBe("77"));
    expect(alertSpy).toHaveBeenCalledWith(
      "打席の削除",
      expect.stringContaining("第1打席"),
      expect.any(Array),
    );
  });

  it("旧仕様試合（is_new_format=false）の打席も同じカード UI で表示される", async () => {
    const game = buildGameResult({ game_result_id: 400 });
    stubByGame(400, [
      buildPlateAppearance({
        id: 1,
        batter_box_number: 1,
        batting_result: "三ゴロ",
        is_new_format: false,
        has_detail_data: false,
        hit_type: null,
        hit_location_x: null,
        hit_location_y: null,
        rbi: null,
        run_scored: null,
        stolen_bases: null,
        caught_stealing: null,
      }),
    ]);

    const { findByText, findByRole } = renderWithProviders(
      <GameResultDetail game={game} onDelete={() => {}} />,
    );

    expect(await findByText("第1打席")).toBeTruthy();
    expect(await findByText("詳細未入力")).toBeTruthy();
    const card = await findByRole("button", { name: "第1打席 三ゴロ" });
    fireEvent.press(card);
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { id: "1", gameResultId: "400" },
      }),
    );
  });
});
