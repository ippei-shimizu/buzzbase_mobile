import type {
  HitType,
  OutType,
  PlateAppearanceV2,
  PlateAppearanceV2Input,
  PlateAppearanceV2Payload,
  RunnersState,
  SwingType,
} from "../types/plateAppearance";
import { create } from "zustand";
import {
  DIRECTION_LABEL_POSITIONS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
  NORMALIZED_LOCATION_PRECISION,
} from "@constants/groundCanvas";

type CounterKey = "rbi" | "runScored" | "stolenBases" | "caughtStealing";

type DetailCountKey = "finalBalls" | "finalStrikes" | "finalOuts";

type MasterSelectionKey = "contactQualityId" | "timingId" | "pitchTypeId";

type MemoKey = "selfAnalysisMemo";

type PitcherSelectionKey = "pitcherId" | "appearanceSituationId";

/**
 * v2 打席ステップ式 UI のウィザード状態。
 * 1 打席分の入力を保持し、`toCreatePayload(gameResultId)` で API リクエスト本体に変換する。
 *
 * 既存の `useGameRecordStore` には触らず、新規記録フローの「打席ウィザード一時状態」だけを
 * このストアに分離する（v1 経路は影響を受けない）。
 *
 * キャンセル時は `reset()` を呼んで状態を破棄する（API 送信なし）。
 */
interface BattingRecordState {
  batterBoxNumber: number | null;
  plateResultId: number | null;
  outType: OutType | null;
  hitType: HitType | null;
  swingType: SwingType | null;
  hitDirectionId: number | null;
  hitLocationX: number | null;
  hitLocationY: number | null;
  rbi: number;
  runScored: number;
  stolenBases: number;
  caughtStealing: number;

  finalBalls: number | null;
  finalStrikes: number | null;
  finalOuts: number | null;
  firstPitchSwing: boolean | null;
  runnersState: RunnersState | null;
  inning: number | null;
  contactQualityId: number | null;
  timingId: number | null;
  pitchTypeId: number | null;
  selfAnalysisMemo: string | null;
  pitcherId: number | null;
  appearanceSituationId: number | null;

  initializeForNew: (batterBoxNumber: number) => void;
  initializeFromExisting: (plateAppearance: PlateAppearanceV2) => void;
  setHitLocation: (x: number, y: number, directionId: number | null) => void;
  clearHitLocation: () => void;
  setPlateResult: (
    plateResultId: number,
    options?: {
      outType?: OutType | null;
      hitType?: HitType | null;
      swingType?: SwingType | null;
    },
  ) => void;
  setCounter: (key: CounterKey, value: number) => void;
  setDetailCount: (key: DetailCountKey, value: number | null) => void;
  setFirstPitchSwing: (value: boolean | null) => void;
  setRunnersState: (value: RunnersState | null) => void;
  setInning: (value: number | null) => void;
  setMasterSelection: (key: MasterSelectionKey, id: number | null) => void;
  setMemo: (key: MemoKey, text: string) => void;
  setPitcherSelection: (key: PitcherSelectionKey, id: number | null) => void;
  toCreatePayload: (gameResultId: number) => PlateAppearanceV2Payload;
  reset: () => void;
}

const initialState = {
  batterBoxNumber: null as number | null,
  plateResultId: null as number | null,
  outType: null as OutType | null,
  hitType: null as HitType | null,
  swingType: null as SwingType | null,
  hitDirectionId: null as number | null,
  hitLocationX: null as number | null,
  hitLocationY: null as number | null,
  rbi: 0,
  runScored: 0,
  stolenBases: 0,
  caughtStealing: 0,

  finalBalls: null as number | null,
  finalStrikes: null as number | null,
  finalOuts: null as number | null,
  firstPitchSwing: null as boolean | null,
  runnersState: null as RunnersState | null,
  inning: null as number | null,
  contactQualityId: null as number | null,
  timingId: null as number | null,
  pitchTypeId: null as number | null,
  selfAnalysisMemo: null as string | null,
  pitcherId: null as number | null,
  appearanceSituationId: null as number | null,
};

/** 正規化座標 (0〜1) を DB の decimal(5,4) に合わせて 4 桁丸めで整形する。 */
const roundLocation = (value: number | null): number | null => {
  if (value === null) return null;
  return Number(value.toFixed(NORMALIZED_LOCATION_PRECISION));
};

/** decimal 文字列（"0.5000" 等）を number に変換する。null/undefined は null。 */
const parseLocationString = (
  value: string | null | undefined,
): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/**
 * hit_direction_id (1〜13) から DIRECTION_LABEL_POSITIONS の中心座標を引いて
 * 正規化座標 (0〜1) に変換する。旧 PA は hit_location_x/y を持たないが
 * hit_direction_id は持っているケースがあるため、編集モードでは方向ラベルの
 * 定位置にマーカーをフォールバック表示してウィザード起動時の体験を整える。
 */
const deriveLocationFromDirection = (
  directionId: number | null,
): { x: number; y: number } | null => {
  if (directionId === null) return null;
  const position = DIRECTION_LABEL_POSITIONS[directionId];
  if (!position) return null;
  return {
    x: position.x / GROUND_CANVAS_WIDTH,
    y: position.y / GROUND_CANVAS_HEIGHT,
  };
};

export const useBattingRecordStore = create<BattingRecordState>((set, get) => ({
  ...initialState,

  initializeForNew: (batterBoxNumber) =>
    set({ ...initialState, batterBoxNumber }),

  initializeFromExisting: (pa) => {
    const parsedX = parseLocationString(pa.hit_location_x);
    const parsedY = parseLocationString(pa.hit_location_y);
    // 旧 PA は hit_location_x/y が NULL だが hit_direction_id を持つことが多いため、
    // 方向ラベルの定位置をフォールバック座標として採用する。
    // x/y の片方だけ NULL だと「DB の値と fallback 定位置の混在」になってしまうので、
    // 両方 NULL のときだけ fallback を引く（DB の値が部分的にあるなら DB を信頼）。
    const fallback =
      parsedX === null && parsedY === null
        ? deriveLocationFromDirection(pa.hit_direction_id)
        : null;
    set({
      batterBoxNumber: pa.batter_box_number,
      plateResultId: pa.plate_result_id,
      outType: pa.out_type,
      hitType: pa.hit_type,
      swingType: pa.swing_type,
      hitDirectionId: pa.hit_direction_id,
      hitLocationX: parsedX ?? fallback?.x ?? null,
      hitLocationY: parsedY ?? fallback?.y ?? null,
      rbi: pa.rbi ?? 0,
      runScored: pa.run_scored ?? 0,
      stolenBases: pa.stolen_bases ?? 0,
      caughtStealing: pa.caught_stealing ?? 0,
      finalBalls: pa.final_balls,
      finalStrikes: pa.final_strikes,
      finalOuts: pa.final_outs,
      firstPitchSwing: pa.first_pitch_swing,
      runnersState: pa.runners_state,
      inning: pa.inning,
      contactQualityId: pa.contact_quality?.id ?? null,
      timingId: pa.timing?.id ?? null,
      pitchTypeId: pa.pitch_type?.id ?? null,
      selfAnalysisMemo: pa.self_analysis_memo,
      pitcherId: pa.pitcher?.id ?? null,
      appearanceSituationId: pa.appearance_situation?.id ?? null,
    });
  },

  setHitLocation: (x, y, directionId) =>
    set({
      hitLocationX: x,
      hitLocationY: y,
      hitDirectionId: directionId,
    }),

  clearHitLocation: () =>
    set({
      hitLocationX: null,
      hitLocationY: null,
      hitDirectionId: null,
    }),

  setPlateResult: (plateResultId, options) =>
    set({
      plateResultId,
      outType: options?.outType ?? null,
      hitType: options?.hitType ?? null,
      swingType: options?.swingType ?? null,
    }),

  setCounter: (key, value) => {
    const next = Math.max(0, value);
    set({ [key]: next } as Pick<BattingRecordState, CounterKey>);
  },

  setDetailCount: (key, value) => {
    if (value === null) {
      set({ [key]: null } as Pick<BattingRecordState, DetailCountKey>);
      return;
    }
    const clamped = Math.max(0, value);
    set({ [key]: clamped } as Pick<BattingRecordState, DetailCountKey>);
  },

  setFirstPitchSwing: (value) => set({ firstPitchSwing: value }),

  setRunnersState: (value) => set({ runnersState: value }),

  setInning: (value) => {
    if (value === null) {
      set({ inning: null });
      return;
    }
    // 0 や負値は「未入力 (null)」として扱う。表示上の最小は 1。
    const normalized = value < 1 ? null : value;
    set({ inning: normalized });
  },

  setMasterSelection: (key, id) => {
    set({ [key]: id } as Pick<BattingRecordState, MasterSelectionKey>);
  },

  setMemo: (key, text) => {
    // 空文字を null に正規化することで、API 送信時に "" と null の表現ぶれを防ぐ。
    const normalized = text.length === 0 ? null : text;
    set({ [key]: normalized } as Pick<BattingRecordState, MemoKey>);
  },

  setPitcherSelection: (key, id) => {
    set({ [key]: id } as Pick<BattingRecordState, PitcherSelectionKey>);
  },

  // 呼び出し前に必ず `isBattingRecordReadyToSubmit` でガードする。React のイベント
  // ハンドラ内で throw された Error は Error Boundary に届かないため、UI 側は
  // 完了ボタンの disabled 制御と二重チェックで未確定状態のリクエストを防ぐ。
  toCreatePayload: (gameResultId) => {
    const state = get();
    if (state.batterBoxNumber === null || state.plateResultId === null) {
      throw new Error(
        "batterBoxNumber と plateResultId が確定する前に payload は生成できません",
      );
    }
    const plate_appearance: PlateAppearanceV2Input = {
      game_result_id: gameResultId,
      batter_box_number: state.batterBoxNumber,
      plate_result_id: state.plateResultId,
      out_type: state.outType,
      hit_type: state.hitType,
      swing_type: state.swingType,
      hit_direction_id: state.hitDirectionId,
      hit_location_x: roundLocation(state.hitLocationX),
      hit_location_y: roundLocation(state.hitLocationY),
      rbi: state.rbi,
      run_scored: state.runScored,
      stolen_bases: state.stolenBases,
      caught_stealing: state.caughtStealing,
      final_balls: state.finalBalls,
      final_strikes: state.finalStrikes,
      final_outs: state.finalOuts,
      first_pitch_swing: state.firstPitchSwing,
      runners_state: state.runnersState,
      inning: state.inning,
      contact_quality_id: state.contactQualityId,
      timing_id: state.timingId,
      pitch_type_id: state.pitchTypeId,
      self_analysis_memo: state.selfAnalysisMemo,
      pitcher_id: state.pitcherId,
      appearance_situation_id: state.appearanceSituationId,
    };
    return { plate_appearance };
  },

  reset: () => set({ ...initialState }),
}));

/**
 * 入力が API 送信可能な状態か（`batterBoxNumber` と `plateResultId` が確定しているか）を判定する。
 * UI 側はこれを「この打席を完了」ボタンの `disabled` 制御に使い、
 * `toCreatePayload` が throw する条件に到達しないようにする。
 */
export const isBattingRecordReadyToSubmit = (
  state: Pick<BattingRecordState, "batterBoxNumber" | "plateResultId">,
): boolean => state.batterBoxNumber !== null && state.plateResultId !== null;
