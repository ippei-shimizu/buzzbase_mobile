/**
 * 打席記録フローの「game record step viewed」計測の結合テスト。
 * 打席リスト表示と、編集モードのウィザードがステップ計測に混ざらないことを見る。
 */
import type { PlateAppearanceV2 } from "../../../../types/plateAppearance";
import { useBattingRecordStore } from "@stores/battingRecordStore";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import EditPlateAppearanceScreen from "../[id]/edit";
import PlateAppearancesListScreen from "../index";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "555" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

const viewedGameRecordSteps = () =>
  mockCapture.mock.calls
    .filter(([event]) => event === "game record step viewed")
    .map(([, properties]) => properties.step);

const buildPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 555,
  game_result_id: 123,
  user_id: 7,
  batter_box_number: 1,
  batting_result: "中安",
  plate_result_id: 7,
  hit_direction_id: 10,
  batting_position_id: null,
  out_type: null,
  hit_type: "single",
  swing_type: null,
  home_run_type: null,
  hit_location_x: "0.5000",
  hit_location_y: "0.3000",
  rbi: 1,
  run_scored: 0,
  stolen_bases: 0,
  caught_stealing: 0,
  final_balls: null,
  final_strikes: null,
  final_outs: null,
  first_pitch_swing: null,
  runners_state: null,
  inning: null,
  pitch_course: null,
  pitch_course_x: null,
  pitch_course_y: null,
  self_analysis_memo: null,
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: false,
  contact_quality: null,
  timing: null,
  pitch_type: null,
  pitcher: null,
  appearance_situation: null,
  created_at: "2026-06-04T10:30:00Z",
  updated_at: "2026-06-04T10:30:00Z",
  ...overrides,
});

beforeEach(() => {
  mockCapture.mockClear();
  useGameRecordStore.getState().reset();
  useBattingRecordStore.getState().reset();
  useGameRecordStore.setState({
    gameResultId: 123,
    userId: 7,
    recordPattern: "batting",
  });

  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [buildPlateAppearance()] }),
    ),
  );
});

describe("打席記録フローのステップ計測", () => {
  it("打席リストを表示すると plate_appearances として計測する", async () => {
    const view = renderWithProviders(<PlateAppearancesListScreen />);
    await view.findByText("打席一覧");

    expect(viewedGameRecordSteps()).toEqual(["plate_appearances"]);
  });

  it("既存打席の編集ではウィザードのステップを計測しない", async () => {
    const view = renderWithProviders(<EditPlateAppearanceScreen />);
    await view.findByRole("button", { name: "この打席を更新" });

    expect(viewedGameRecordSteps()).toEqual([]);
  });
});
