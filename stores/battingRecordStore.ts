import type {
  HitType,
  OutType,
  PlateAppearanceV2Payload,
  PlateAppearanceV2Input,
} from "../types/plateAppearance";
import { create } from "zustand";
import { NORMALIZED_LOCATION_PRECISION } from "@constants/groundCanvas";

type CounterKey = "rbi" | "runScored" | "stolenBases" | "caughtStealing";

/**
 * v2 打席ステップ式 UI のウィザード状態。
 * 1 打席分の入力を保持し、`toCreatePayload(gameResultId)` で API リクエスト本体に変換する。
 *
 * 既存の `useGameRecordStore` には触らず、新規記録フローの「打席ウィザード一時状態」だけを
 * このストアに分離する（編集モード／v1 経路は影響を受けない）。
 *
 * キャンセル時は `reset()` を呼んで状態を破棄する（API 送信なし）。
 */
interface BattingRecordState {
  batterBoxNumber: number | null;
  plateResultId: number | null;
  outType: OutType | null;
  hitType: HitType | null;
  hitDirectionId: number | null;
  hitDepthId: number | null;
  hitLocationX: number | null;
  hitLocationY: number | null;
  rbi: number;
  runScored: number;
  stolenBases: number;
  caughtStealing: number;

  initializeForNew: (batterBoxNumber: number) => void;
  setHitLocation: (
    x: number,
    y: number,
    directionId: number | null,
    depthId: number | null,
  ) => void;
  clearHitLocation: () => void;
  setPlateResult: (
    plateResultId: number,
    options?: { outType?: OutType | null; hitType?: HitType | null },
  ) => void;
  setCounter: (key: CounterKey, value: number) => void;
  toCreatePayload: (gameResultId: number) => PlateAppearanceV2Payload;
  reset: () => void;
}

const initialState = {
  batterBoxNumber: null as number | null,
  plateResultId: null as number | null,
  outType: null as OutType | null,
  hitType: null as HitType | null,
  hitDirectionId: null as number | null,
  hitDepthId: null as number | null,
  hitLocationX: null as number | null,
  hitLocationY: null as number | null,
  rbi: 0,
  runScored: 0,
  stolenBases: 0,
  caughtStealing: 0,
};

/** 正規化座標 (0〜1) を DB の decimal(5,4) に合わせて 4 桁丸めで整形する。 */
const roundLocation = (value: number | null): number | null => {
  if (value === null) return null;
  return Number(value.toFixed(NORMALIZED_LOCATION_PRECISION));
};

export const useBattingRecordStore = create<BattingRecordState>((set, get) => ({
  ...initialState,

  initializeForNew: (batterBoxNumber) =>
    set({ ...initialState, batterBoxNumber }),

  setHitLocation: (x, y, directionId, depthId) =>
    set({
      hitLocationX: x,
      hitLocationY: y,
      hitDirectionId: directionId,
      hitDepthId: depthId,
    }),

  clearHitLocation: () =>
    set({
      hitLocationX: null,
      hitLocationY: null,
      hitDirectionId: null,
      hitDepthId: null,
    }),

  setPlateResult: (plateResultId, options) =>
    set({
      plateResultId,
      outType: options?.outType ?? null,
      hitType: options?.hitType ?? null,
    }),

  setCounter: (key, value) => {
    const next = Math.max(0, value);
    set({ [key]: next } as Pick<BattingRecordState, CounterKey>);
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
      hit_direction_id: state.hitDirectionId,
      hit_depth_id: state.hitDepthId,
      hit_location_x: roundLocation(state.hitLocationX),
      hit_location_y: roundLocation(state.hitLocationY),
      rbi: state.rbi,
      run_scored: state.runScored,
      stolen_bases: state.stolenBases,
      caught_stealing: state.caughtStealing,
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
