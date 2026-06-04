/**
 * 打席ステップ式 UI のフロー結合テスト。
 *
 * Step1 (タップ → ヒット → 単打) → Step2 (打点 +1 → この打席を完了)
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
  );
});

describe("打席ステップ式ウィザードのフロー", () => {
  it("タップ → ヒット → 単打 → 打点 1 → 完了 で POST /api/v2/plate_appearances が期待 payload で呼ばれる", async () => {
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

    // ゾーン取得とリスト取得を待つため、グラウンドが表示されるのを起点にする
    const ground = await view.findByLabelText("グラウンド");

    // 1. 中ゾーン（深さ=2, 外野）をタップ
    fireEvent(ground, "press", {
      nativeEvent: { locationX: 420 * 0.5, locationY: 340 * 0.3 },
    });

    // 2. ヒットボタン → サブモーダル → 単打 を選ぶ
    fireEvent.press(view.getByRole("button", { name: "ヒット" }));
    fireEvent.press(view.getByRole("button", { name: "単打" }));

    // 3. Step2 (counter) に切り替わり、打点 NumberInput を 1 に書き換え
    await view.findByLabelText("この打席を完了");
    const inputs = view.UNSAFE_getAllByProps({ keyboardType: "number-pad" });
    fireEvent.changeText(inputs[0], "1");

    // 4. 「この打席を完了」を押下 → API リクエスト発火
    fireEvent.press(view.getByLabelText("この打席を完了"));

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
      hit_depth_id: 2,
      rbi: 1,
    });
    expect(capturedPayload!.plate_appearance.hit_location_x).toBeCloseTo(0.5);
    expect(capturedPayload!.plate_appearance.hit_location_y).toBeCloseTo(0.3);
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
