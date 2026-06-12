/**
 * `useBattingRecordStore` の純粋ロジック単体テスト。
 *
 * UI / API には依存させず、setter・初期化・toCreatePayload の往復だけ検証する。
 * 詳細項目（#334）追加に伴うリグレッション防止が主目的。
 */
import type { PlateAppearanceV2 } from "../../types/plateAppearance";
import { useBattingRecordStore } from "../battingRecordStore";

const buildPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 1,
  game_result_id: 100,
  user_id: 1,
  batter_box_number: 2,
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
  final_balls: 3,
  final_strikes: 2,
  final_outs: 1,
  first_pitch_swing: true,
  runners_state: "first",
  inning: 5,
  self_analysis_memo: "高めの球を強振",
  opponent_memo: "初球はストレート",
  is_new_format: true,
  has_detail_data: true,
  contact_quality: { id: 1, name: "真芯", display_order: 1 },
  timing: { id: 2, name: "ドンピシャ", display_order: 1 },
  pitch_type: { id: 3, name: "スライダー系", display_order: 5 },
  pitcher: null,
  appearance_situation: null,
  created_at: "2026-06-08T10:00:00Z",
  updated_at: "2026-06-08T10:00:00Z",
  ...overrides,
});

beforeEach(() => {
  useBattingRecordStore.getState().reset();
});

describe("useBattingRecordStore - 詳細項目", () => {
  it("initializeFromExisting で詳細 11 フィールドが store に反映される", () => {
    useBattingRecordStore
      .getState()
      .initializeFromExisting(buildPlateAppearance());

    const state = useBattingRecordStore.getState();
    expect(state.finalBalls).toBe(3);
    expect(state.finalStrikes).toBe(2);
    expect(state.finalOuts).toBe(1);
    expect(state.firstPitchSwing).toBe(true);
    expect(state.runnersState).toBe("first");
    expect(state.inning).toBe(5);
    expect(state.contactQualityId).toBe(1);
    expect(state.timingId).toBe(2);
    expect(state.pitchTypeId).toBe(3);
    expect(state.selfAnalysisMemo).toBe("高めの球を強振");
  });

  it("マスタ未設定の既存打席ではマスタ ID が null になる", () => {
    useBattingRecordStore.getState().initializeFromExisting(
      buildPlateAppearance({
        contact_quality: null,
        timing: null,
        pitch_type: null,
      }),
    );
    const state = useBattingRecordStore.getState();
    expect(state.contactQualityId).toBeNull();
    expect(state.timingId).toBeNull();
    expect(state.pitchTypeId).toBeNull();
  });

  it("setMasterSelection で値の設定と解除ができる", () => {
    const store = useBattingRecordStore.getState();
    store.setMasterSelection("contactQualityId", 4);
    expect(useBattingRecordStore.getState().contactQualityId).toBe(4);
    store.setMasterSelection("contactQualityId", null);
    expect(useBattingRecordStore.getState().contactQualityId).toBeNull();
  });

  it("setMemo は空文字を null に正規化し、非空文字列はそのまま保持する", () => {
    const store = useBattingRecordStore.getState();
    store.setMemo("selfAnalysisMemo", "テスト");
    expect(useBattingRecordStore.getState().selfAnalysisMemo).toBe("テスト");
    store.setMemo("selfAnalysisMemo", "");
    expect(useBattingRecordStore.getState().selfAnalysisMemo).toBeNull();
  });

  it("setInning は 0 以下を null に正規化する", () => {
    const store = useBattingRecordStore.getState();
    store.setInning(5);
    expect(useBattingRecordStore.getState().inning).toBe(5);
    store.setInning(0);
    expect(useBattingRecordStore.getState().inning).toBeNull();
    store.setInning(null);
    expect(useBattingRecordStore.getState().inning).toBeNull();
  });

  it("setDetailCount は負値を 0 にクランプし、null はそのまま保持する", () => {
    const store = useBattingRecordStore.getState();
    store.setDetailCount("finalBalls", 2);
    expect(useBattingRecordStore.getState().finalBalls).toBe(2);
    store.setDetailCount("finalBalls", -1);
    expect(useBattingRecordStore.getState().finalBalls).toBe(0);
    store.setDetailCount("finalBalls", null);
    expect(useBattingRecordStore.getState().finalBalls).toBeNull();
  });

  it("toCreatePayload に詳細フィールド 11 個がすべて含まれる（未入力は null）", () => {
    useBattingRecordStore.getState().initializeForNew(1);
    useBattingRecordStore.getState().setPlateResult(7, { hitType: "single" });
    const payload = useBattingRecordStore.getState().toCreatePayload(100);
    const pa = payload.plate_appearance;
    expect(pa).toHaveProperty("final_balls", null);
    expect(pa).toHaveProperty("final_strikes", null);
    expect(pa).toHaveProperty("final_outs", null);
    expect(pa).toHaveProperty("first_pitch_swing", null);
    expect(pa).toHaveProperty("runners_state", null);
    expect(pa).toHaveProperty("inning", null);
    expect(pa).toHaveProperty("contact_quality_id", null);
    expect(pa).toHaveProperty("timing_id", null);
    expect(pa).toHaveProperty("pitch_type_id", null);
    expect(pa).toHaveProperty("self_analysis_memo", null);
  });

  it("詳細項目に値を入れた状態で toCreatePayload を呼ぶと API ペイロードに値が乗る", () => {
    const store = useBattingRecordStore.getState();
    store.initializeForNew(1);
    store.setPlateResult(7, { hitType: "single" });
    store.setRunnersState("second");
    store.setFirstPitchSwing(true);
    store.setDetailCount("finalBalls", 2);
    store.setMasterSelection("contactQualityId", 5);
    store.setMemo("selfAnalysisMemo", "差し込まれた");

    const payload = useBattingRecordStore.getState().toCreatePayload(100);
    expect(payload.plate_appearance).toMatchObject({
      runners_state: "second",
      first_pitch_swing: true,
      final_balls: 2,
      contact_quality_id: 5,
      self_analysis_memo: "差し込まれた",
    });
  });

  it("reset で全フィールドが initialState に戻る", () => {
    const store = useBattingRecordStore.getState();
    store.initializeFromExisting(buildPlateAppearance());
    store.reset();
    const state = useBattingRecordStore.getState();
    expect(state.finalBalls).toBeNull();
    expect(state.runnersState).toBeNull();
    expect(state.contactQualityId).toBeNull();
    expect(state.selfAnalysisMemo).toBeNull();
    expect(state.inning).toBeNull();
    expect(state.firstPitchSwing).toBeNull();
  });
});
