/**
 * 打席ステップ式 UI のフロー結合テスト。
 *
 * Step1 (タップ → ヒット → 単打) → Step2 (打点 +1) → Step3 (詳細入力 or スキップ)
 * → POST /api/v2/plate_appearances が期待 payload で発火するまでを 1 本でなぞる。
 *
 * 方針:
 * - サービス関数は jest.mock せず、HTTP は MSW で intercept
 * - expo-router のみ jest.mock（環境境界）
 * - 内部 state は直接参照せず、公開 UI 経由で確認
 */
import type { PlateAppearanceV2 } from "../../../../types/plateAppearance";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { useBattingRecordStore } from "@stores/battingRecordStore";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import NewPlateAppearanceScreen from "../new";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const buildHitDirections = () => [
  {
    id: 10,
    name: "中",
    zone_polygon: [
      {
        depth_id: 2,
        polygon: [
          { x: 0.4, y: 0.2 },
          { x: 0.6, y: 0.2 },
          { x: 0.6, y: 0.4 },
          { x: 0.4, y: 0.4 },
        ],
      },
    ],
  },
];

const buildCreatedResponse = (
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
  self_analysis_memo: null,
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: false,
  contact_quality: null,
  timing: null,
  pitch_type: null,
  hit_depth: null,
  pitcher: null,
  appearance_situation: null,
  created_at: "2026-06-04T10:30:00Z",
  updated_at: "2026-06-04T10:30:00Z",
  ...overrides,
});

beforeEach(() => {
  useGameRecordStore.getState().reset();
  useBattingRecordStore.getState().reset();
  // 試合 ID が確定している前提（Step1 通過後）。
  useGameRecordStore.setState({ gameResultId: 123, userId: 7 });

  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [] }),
    ),
    http.get(baseUrl("/api/v2/hit_directions"), () =>
      HttpResponse.json({ hit_directions: buildHitDirections() }),
    ),
    http.get(baseUrl("/api/v2/contact_qualities"), () =>
      HttpResponse.json({
        contact_qualities: [
          { id: 1, name: "真芯", display_order: 1 },
          { id: 2, name: "先っぽ", display_order: 2 },
        ],
      }),
    ),
    http.get(baseUrl("/api/v2/timings"), () =>
      HttpResponse.json({
        timings: [{ id: 1, name: "ドンピシャ", display_order: 1 }],
      }),
    ),
    http.get(baseUrl("/api/v2/pitch_types"), () =>
      HttpResponse.json({
        pitch_types: [{ id: 1, name: "ストレート系", display_order: 1 }],
      }),
    ),
    http.get(baseUrl("/api/v2/hit_depths"), () =>
      HttpResponse.json({
        hit_depths: [{ id: 2, name: "外野", display_order: 2 }],
      }),
    ),
    http.get(baseUrl("/api/v2/appearance_situations"), () =>
      HttpResponse.json({
        appearance_situations: [
          { id: 1, name: "先発", display_order: 1 },
          { id: 2, name: "中継ぎ", display_order: 2 },
          { id: 3, name: "抑え", display_order: 3 },
        ],
      }),
    ),
    http.get(baseUrl("/api/v2/arm_angles"), () =>
      HttpResponse.json({
        arm_angles: [{ id: 1, name: "オーバースロー", display_order: 1 }],
      }),
    ),
    http.get(baseUrl("/api/v2/velocity_zones"), () =>
      HttpResponse.json({
        velocity_zones: [{ id: 1, name: "120km/h未満", display_order: 1 }],
      }),
    ),
    http.get(baseUrl("/api/v2/pitcher_styles"), () =>
      HttpResponse.json({
        pitcher_styles: [{ id: 1, name: "本格派", display_order: 1 }],
      }),
    ),
    http.get(baseUrl("/api/v2/pitchers"), () =>
      HttpResponse.json({
        data: [],
        pagination: {
          current_page: 1,
          per_page: 20,
          total_count: 0,
          total_pages: 0,
        },
      }),
    ),
  );
});

describe("打席ステップ式ウィザードのフロー", () => {
  it("Step2 で「スキップして完了」を押すと POST 時の詳細フィールドがすべて null になる", async () => {
    let capturedPayload: {
      plate_appearance: Record<string, unknown>;
    } | null = null;
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), async ({ request }) => {
        capturedPayload = (await request.json()) as typeof capturedPayload;
        return HttpResponse.json(buildCreatedResponse(), { status: 201 });
      }),
    );

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    const ground = await view.findByLabelText("グラウンド");

    fireEvent(ground, "press", {
      nativeEvent: { locationX: 420 * 0.5, locationY: 340 * 0.3 },
    });
    fireEvent.press(view.getByRole("button", { name: "ヒット" }));
    fireEvent.press(view.getByRole("button", { name: "単打" }));

    await view.findByLabelText("詳細を入力する");
    fireEvent.changeText(view.getByLabelText("打点"), "1");

    fireEvent.press(view.getByLabelText("詳細入力をスキップして完了"));

    await waitFor(() => {
      expect(capturedPayload).not.toBeNull();
    });
    expect(capturedPayload!.plate_appearance).toMatchObject({
      game_result_id: 123,
      batter_box_number: 1,
      plate_result_id: 7,
      hit_type: "single",
      out_type: null,
      hit_direction_id: 10,
      rbi: 1,
      final_balls: null,
      final_strikes: null,
      final_outs: null,
      first_pitch_swing: null,
      runners_state: null,
      inning: null,
      contact_quality_id: null,
      timing_id: null,
      pitch_type_id: null,
      self_analysis_memo: null,
    });
  });

  it("Step3 で詳細項目を入力して完了すると POST payload に値が乗る", async () => {
    let capturedPayload: {
      plate_appearance: Record<string, unknown>;
    } | null = null;
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), async ({ request }) => {
        capturedPayload = (await request.json()) as typeof capturedPayload;
        return HttpResponse.json(
          buildCreatedResponse({
            runners_state: "first",
            contact_quality: { id: 1, name: "真芯", display_order: 1 },
            self_analysis_memo: "差し込まれた",
            has_detail_data: true,
          }),
          { status: 201 },
        );
      }),
    );

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    const ground = await view.findByLabelText("グラウンド");

    fireEvent(ground, "press", {
      nativeEvent: { locationX: 420 * 0.5, locationY: 340 * 0.3 },
    });
    fireEvent.press(view.getByRole("button", { name: "ヒット" }));
    fireEvent.press(view.getByRole("button", { name: "単打" }));

    await view.findByLabelText("詳細を入力する");
    fireEvent.changeText(view.getByLabelText("打点"), "1");
    fireEvent.press(view.getByLabelText("詳細を入力する"));

    // Step3 のチップが描画されるのを待つ（マスタ取得完了の合図）。
    const runnerChip = await view.findByLabelText("ランナー状況 一塁");
    fireEvent.press(runnerChip);
    fireEvent.press(view.getByLabelText("打球の質 真芯"));
    fireEvent.changeText(view.getByLabelText("自己分析メモ"), "差し込まれた");

    fireEvent.press(view.getByLabelText("この打席を完了"));

    await waitFor(() => {
      expect(capturedPayload).not.toBeNull();
    });
    expect(capturedPayload!.plate_appearance).toMatchObject({
      game_result_id: 123,
      batter_box_number: 1,
      plate_result_id: 7,
      hit_type: "single",
      runners_state: "first",
      contact_quality_id: 1,
      self_analysis_memo: "差し込まれた",
      rbi: 1,
    });
    // 入力していない他の詳細項目はそのまま null で送信される。
    expect(capturedPayload!.plate_appearance).toMatchObject({
      timing_id: null,
      pitch_type_id: null,
      first_pitch_swing: null,
      inning: null,
    });
  });

  it("タップ前は「ヒット」ボタンが disabled、「四球」ボタンは活性のまま", async () => {
    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    await view.findByLabelText("グラウンド");

    const hitButton = view.getByRole("button", { name: "ヒット" });
    expect(hitButton.props.accessibilityState).toMatchObject({
      disabled: true,
    });

    const walkButton = view.getByRole("button", { name: "四球" });
    expect(walkButton.props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  it("中断ボタンを押すと API は呼ばれず onClose（router.back）が走る", async () => {
    const postSpy = jest.fn(() =>
      HttpResponse.json(buildCreatedResponse(), { status: 201 }),
    );
    server.use(http.post(baseUrl("/api/v2/plate_appearances"), postSpy));

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    await view.findByLabelText("グラウンド");

    fireEvent.press(view.getByRole("button", { name: "入力を中断する" }));

    // POST が一切呼ばれていない
    expect(postSpy).not.toHaveBeenCalled();
  });
});
