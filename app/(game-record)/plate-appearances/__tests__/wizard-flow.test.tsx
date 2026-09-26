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
import { fireEvent, waitFor } from "@testing-library/react-native";
import { useBattingRecordStore } from "@stores/battingRecordStore";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { buildPlateAppearanceV2 } from "../../../../__tests__/test-utils/factories/plateAppearance";
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

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

const viewedGameRecordSteps = () =>
  mockCapture.mock.calls
    .filter(([event]) => event === "game record step viewed")
    .map(([, properties]) => properties.step);

beforeEach(() => {
  mockCapture.mockClear();
  useGameRecordStore.getState().reset();
  useBattingRecordStore.getState().reset();
  // 試合 ID が確定している前提（Step1 通過後）。
  useGameRecordStore.setState({ gameResultId: 123, userId: 7 });

  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [] }),
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
        return HttpResponse.json(buildPlateAppearanceV2(), { status: 201 });
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

  it("「走本塁打」を選ぶと plate_result_id は本塁打のまま home_run_type が POST される", async () => {
    let capturedPayload: {
      plate_appearance: Record<string, unknown>;
    } | null = null;
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), async ({ request }) => {
        capturedPayload = (await request.json()) as typeof capturedPayload;
        return HttpResponse.json(
          buildPlateAppearanceV2({
            plate_result_id: 10,
            hit_type: "home_run",
            home_run_type: "inside_the_park",
            batting_result: "中走本",
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
    fireEvent.press(view.getByRole("button", { name: "走本塁打" }));

    await view.findByLabelText("詳細を入力する");
    fireEvent.press(view.getByLabelText("詳細入力をスキップして完了"));

    await waitFor(() => {
      expect(capturedPayload).not.toBeNull();
    });
    expect(capturedPayload!.plate_appearance).toMatchObject({
      plate_result_id: 10,
      hit_type: "home_run",
      home_run_type: "inside_the_park",
    });
  });

  it("「本塁打」を選ぶと home_run_type は柵越えとして POST される", async () => {
    let capturedPayload: {
      plate_appearance: Record<string, unknown>;
    } | null = null;
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), async ({ request }) => {
        capturedPayload = (await request.json()) as typeof capturedPayload;
        return HttpResponse.json(
          buildPlateAppearanceV2({
            plate_result_id: 10,
            hit_type: "home_run",
            home_run_type: "over_fence",
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
    fireEvent.press(view.getByRole("button", { name: "本塁打" }));

    await view.findByLabelText("詳細を入力する");
    fireEvent.press(view.getByLabelText("詳細入力をスキップして完了"));

    await waitFor(() => {
      expect(capturedPayload).not.toBeNull();
    });
    expect(capturedPayload!.plate_appearance).toMatchObject({
      plate_result_id: 10,
      hit_type: "home_run",
      home_run_type: "over_fence",
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
          buildPlateAppearanceV2({
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
    // ランナー状況はダイヤモンド UI（各塁のタップでトグル）。
    const firstBase = await view.findByLabelText("一塁");
    fireEvent.press(firstBase);
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
      HttpResponse.json(buildPlateAppearanceV2(), { status: 201 }),
    );
    server.use(http.post(baseUrl("/api/v2/plate_appearances"), postSpy));

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    await view.findByLabelText("グラウンド");

    fireEvent.press(view.getByRole("button", { name: "入力を中断する" }));

    // POST が一切呼ばれていない
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("結果選択 → 打点入力 → 詳細入力 → 結果選択への戻りを、表示したステップとして順に計測する", async () => {
    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    const ground = await view.findByLabelText("グラウンド");
    expect(viewedGameRecordSteps()).toEqual(["plate_appearance_result"]);

    fireEvent(ground, "press", {
      nativeEvent: { locationX: 420 * 0.5, locationY: 340 * 0.3 },
    });
    fireEvent.press(view.getByRole("button", { name: "ヒット" }));
    fireEvent.press(view.getByRole("button", { name: "単打" }));
    await view.findByLabelText("詳細を入力する");
    fireEvent.press(view.getByLabelText("詳細を入力する"));
    await view.findByLabelText("一塁");
    fireEvent.press(
      view.getByRole("button", { name: "打点・盗塁の入力に戻る" }),
    );
    fireEvent.press(view.getByRole("button", { name: "打席結果の選択に戻る" }));
    await view.findByLabelText("グラウンド");

    expect(viewedGameRecordSteps()).toEqual([
      "plate_appearance_result",
      "plate_appearance_counter",
      "plate_appearance_detail",
      "plate_appearance_counter",
      "plate_appearance_result",
    ]);
  });

  it("打球方向と詳細を入力して完了すると、入力した項目のフラグを true にして計測する", async () => {
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), () =>
        HttpResponse.json(buildPlateAppearanceV2(), { status: 201 }),
      ),
    );

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    const ground = await view.findByLabelText("グラウンド");

    fireEvent(ground, "press", {
      nativeEvent: { locationX: 420 * 0.5, locationY: 340 * 0.3 },
    });
    fireEvent.press(view.getByRole("button", { name: "ヒット" }));
    fireEvent.press(view.getByRole("button", { name: "単打" }));
    await view.findByLabelText("詳細を入力する");
    fireEvent.press(view.getByLabelText("詳細を入力する"));

    fireEvent.press(await view.findByLabelText("一塁"));
    fireEvent.press(view.getByLabelText("打球の質 真芯"));
    const courseField = view.getByLabelText("コース図");
    fireEvent(courseField, "layout", {
      nativeEvent: { layout: { width: 200, height: 200 } },
    });
    fireEvent(courseField, "press", {
      nativeEvent: { locationX: 100, locationY: 100 },
    });
    fireEvent.press(view.getByLabelText("この打席を完了"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        is_edit: false,
        has_hit_direction: true,
        has_detail: true,
        has_pitcher: false,
        has_count: false,
        has_situation: true,
        has_first_pitch_swing: false,
        has_contact_quality: true,
        has_timing: false,
        has_pitch_type: false,
        has_pitch_course: true,
        has_memo: false,
      }),
    );
  });

  it("打球方向なしの結果を詳細なしで完了すると、すべてのフラグを false で計測する", async () => {
    server.use(
      http.post(baseUrl("/api/v2/plate_appearances"), () =>
        HttpResponse.json(buildPlateAppearanceV2(), { status: 201 }),
      ),
    );

    const view = renderWithProviders(<NewPlateAppearanceScreen />);
    await view.findByLabelText("グラウンド");

    fireEvent.press(view.getByRole("button", { name: "四球" }));
    fireEvent.press(await view.findByLabelText("詳細入力をスキップして完了"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("plate appearance completed", {
        is_edit: false,
        has_hit_direction: false,
        has_detail: false,
        has_pitcher: false,
        has_count: false,
        has_situation: false,
        has_first_pitch_swing: false,
        has_contact_quality: false,
        has_timing: false,
        has_pitch_type: false,
        has_pitch_course: false,
        has_memo: false,
      }),
    );
  });
});
