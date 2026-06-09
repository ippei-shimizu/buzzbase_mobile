import type {
  AppearanceType,
  BattingBox,
  RecordPattern,
} from "../types/gameRecord";
import type { GameResult } from "../types/gameResult";
import { create } from "zustand";
import {
  getResultText,
  isHitDirectionDisabledForResult,
} from "@constants/battingData";
import { formatMatchTypeLabel } from "@utils/matchType";

/**
 * バックエンドの match_type 内部表現（regular / open）を
 * フォーム表示用の日本語ラベル（公式戦 / オープン戦）に変換する。
 * ラジオの value 比較が表示ラベルベースのため、編集モードで API レスポンスを
 * そのまま入れるとラジオが選択されない問題を防ぐ。
 *
 * 共通の {@link formatMatchTypeLabel} に委譲しつつ、本ストア固有の
 * 「null/undefined はフォーム既定値の "公式戦" にフォールバックする」挙動を維持する。
 */
function humanizeMatchType(value: string | null | undefined): string {
  return formatMatchTypeLabel(value) ?? "公式戦";
}

interface GameRecordState {
  // 編集モード
  isEditMode: boolean;

  // IDs
  userId: number | null;
  gameResultId: number | null;
  matchResultId: number | null;
  battingAverageId: number | null;
  pitchingResultId: number | null;

  // Step1: 試合情報
  seasonId: number | null;
  seasonName: string;
  tournamentId: number | null;
  tournamentName: string;
  date: string;
  matchType: string;
  myTeamName: string;
  myTeamId: number | null;
  opponentTeamName: string;
  opponentTeamId: number | null;
  // 初期値は 0（多くの試合で 0 から増えていくため）。ユーザーが手入力で
  // 空欄にしたときは null として扱い、Step1 のバリデーションでエラーを返す。
  myTeamScore: number | null;
  opponentTeamScore: number | null;
  battingOrder: string;
  defensivePosition: string;
  memo: string;
  inningFormat: number;
  appearanceType: AppearanceType;
  // 球場は任意項目。stadiumId は match_results.stadium_id として送信される。
  stadiumId: number | null;
  stadiumName: string;
  // 記録パターン分岐は DB に保存せずクライアント状態のみで保持する。
  recordPattern: RecordPattern | null;

  // Step2: 打撃成績
  battingBoxes: BattingBox[];
  runsBattedIn: number;
  run: number;
  stealingBase: number;
  caughtStealing: number;
  battingError: number;

  // Step3: 投手成績
  win: number;
  loss: number;
  hold: number;
  saves: number;
  inningsPitchedWhole: number;
  inningsPitchedFraction: number;
  numberOfPitches: number;
  gotToTheDistance: boolean;
  runAllowed: number;
  earnedRun: number;
  hitsAllowed: number;
  homeRunsHit: number;
  strikeouts: number;
  pitchingBaseOnBalls: number;
  pitchingHitByPitch: number;

  // アクション
  setField: <K extends keyof GameRecordState>(
    key: K,
    value: GameRecordState[K],
  ) => void;
  setBattingBoxes: (boxes: BattingBox[]) => void;
  addBattingBox: () => void;
  removeBattingBox: (index: number) => void;
  updateBattingBoxPosition: (index: number, positionId: number) => void;
  updateBattingBoxResult: (index: number, resultId: number) => void;
  computeInningsPitched: () => number;
  loadFromGameResult: (game: GameResult) => void;
  reset: () => void;
}

const initialState = {
  isEditMode: false,

  userId: null,
  gameResultId: null,
  matchResultId: null,
  battingAverageId: null,
  pitchingResultId: null,

  seasonId: null,
  seasonName: "",
  tournamentId: null,
  tournamentName: "",
  date: (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })(),
  // GameInfoForm のラジオは「公式戦 / オープン戦」のみ。サーバーへ送信時に
  // MatchTypeConvertible で "公式戦" → "regular" に正規化される。
  matchType: "公式戦",
  myTeamName: "",
  myTeamId: null,
  opponentTeamName: "",
  opponentTeamId: null,
  myTeamScore: 0,
  opponentTeamScore: 0,
  battingOrder: "1",
  defensivePosition: "",
  memo: "",
  // 試合のイニング制（7 or 9）。新規作成時は form_defaults で直近試合の値に上書きされる。
  inningFormat: 9,
  // 出場区分。先発・代打のみ・代走のみのいずれか。デフォルトは先発。
  appearanceType: "starter" as AppearanceType,

  stadiumId: null,
  stadiumName: "",
  recordPattern: null as RecordPattern | null,

  battingBoxes: [{ id: 0, position: 0, result: 0, text: "--" }],
  runsBattedIn: 0,
  run: 0,
  stealingBase: 0,
  caughtStealing: 0,
  battingError: 0,

  win: 0,
  loss: 0,
  hold: 0,
  saves: 0,
  inningsPitchedWhole: 0,
  inningsPitchedFraction: 0,
  numberOfPitches: 0,
  gotToTheDistance: false,
  runAllowed: 0,
  earnedRun: 0,
  hitsAllowed: 0,
  homeRunsHit: 0,
  strikeouts: 0,
  pitchingBaseOnBalls: 0,
  pitchingHitByPitch: 0,
};

export const useGameRecordStore = create<GameRecordState>((set, get) => ({
  ...initialState,

  setField: (key, value) => set({ [key]: value }),

  setBattingBoxes: (boxes) => set({ battingBoxes: boxes }),

  addBattingBox: () => {
    const boxes = get().battingBoxes;
    set({
      battingBoxes: [...boxes, { id: 0, position: 0, result: 0, text: "--" }],
    });
  },

  removeBattingBox: (index) => {
    const boxes = get().battingBoxes.filter((_, i) => i !== index);
    set({
      battingBoxes:
        boxes.length > 0
          ? boxes
          : [{ id: 0, position: 0, result: 0, text: "--" }],
    });
  },

  updateBattingBoxPosition: (index, positionId) => {
    const boxes = get().battingBoxes.map((box, i) => {
      if (i !== index) return box;
      return {
        ...box,
        position: positionId,
        text: getResultText(positionId, box.result),
      };
    });
    set({ battingBoxes: boxes });
  },

  /**
   * 打席の結果を更新する。
   *
   * 三振・振り逃げ・四球・死球・打撃妨害・走塁妨害・併殺打のように
   * 打球方向が伴わない結果が選ばれた場合は、保存されている position も
   * 0（"-"）にリセットする。これにより:
   *   - サマリー表示の text が「捕三振」「投四球」のような無意味な組み合わせにならない
   *   - 後続でユーザーが結果を打球を伴うものに変更し直したとき、誤った打球方向が残らない
   *
   * @param index 対象の打席 index
   * @param resultId `battingResultsList` の id
   */
  updateBattingBoxResult: (index, resultId) => {
    const boxes = get().battingBoxes.map((box, i) => {
      if (i !== index) return box;
      const nextPosition = isHitDirectionDisabledForResult(resultId)
        ? 0
        : box.position;
      return {
        ...box,
        position: nextPosition,
        result: resultId,
        text: getResultText(nextPosition, resultId),
      };
    });
    set({ battingBoxes: boxes });
  },

  computeInningsPitched: () => {
    const s = get();
    return s.inningsPitchedWhole + s.inningsPitchedFraction / 3;
  },

  loadFromGameResult: (game) => {
    const mr = game.match_result;
    const ba = game.batting_average;
    const pr = game.pitching_result;

    // plate_appearances → battingBoxes への変換
    const battingBoxes: BattingBox[] =
      game.plate_appearances.length > 0
        ? game.plate_appearances
            .sort((a, b) => a.batter_box_number - b.batter_box_number)
            .map((pa) => ({
              id: pa.id,
              position: pa.batting_position_id ?? 0,
              result: pa.plate_result_id ?? 0,
              text: getResultText(
                pa.batting_position_id ?? 0,
                pa.plate_result_id ?? 0,
              ),
            }))
        : [{ id: 0, position: 0, result: 0, text: "--" }];

    // innings_pitched（小数）→ whole + fraction への分解
    let inningsPitchedWhole = 0;
    let inningsPitchedFraction = 0;
    if (pr) {
      inningsPitchedWhole = Math.floor(pr.innings_pitched);
      const decimal = pr.innings_pitched - inningsPitchedWhole;
      // 0.333... → 1, 0.666... → 2
      inningsPitchedFraction = Math.round(decimal * 3);
    }

    set({
      isEditMode: true,

      userId: game.user_id,
      gameResultId: game.game_result_id,
      matchResultId: mr.id,
      battingAverageId: ba?.id ?? null,
      pitchingResultId: pr?.id ?? null,
      seasonId: game.season_id,
      seasonName: game.season_name ?? "",

      tournamentId: mr.tournament_id,
      tournamentName: mr.tournament_name ?? "",
      date: mr.date_and_time.split("T")[0],
      matchType: humanizeMatchType(mr.match_type),
      myTeamName: mr.my_team_name ?? "",
      myTeamId: mr.my_team_id,
      opponentTeamName: mr.opponent_team_name,
      opponentTeamId: mr.opponent_team_id,
      myTeamScore: mr.my_team_score,
      opponentTeamScore: mr.opponent_team_score,
      battingOrder: mr.batting_order,
      defensivePosition: mr.defensive_position,
      memo: mr.memo ?? "",
      inningFormat: mr.inning_format ?? 9,
      appearanceType: mr.appearance_type ?? "starter",
      stadiumId: mr.stadium_id ?? null,
      stadiumName: mr.stadium_name ?? "",
      // 編集モードでは記録パターンを明示的に選ばせず、Step2/Step3 をすべて表示する。
      recordPattern: null,

      battingBoxes,
      runsBattedIn: ba?.runs_batted_in ?? 0,
      run: ba?.run ?? 0,
      stealingBase: ba?.stealing_base ?? 0,
      caughtStealing: ba?.caught_stealing ?? 0,
      battingError: ba?.error ?? 0,

      win: pr?.win ?? 0,
      loss: pr?.loss ?? 0,
      hold: pr?.hold ?? 0,
      saves: pr?.saves ?? 0,
      inningsPitchedWhole,
      inningsPitchedFraction,
      numberOfPitches: pr?.number_of_pitches ?? 0,
      gotToTheDistance: pr?.got_to_the_distance ?? false,
      runAllowed: pr?.run_allowed ?? 0,
      earnedRun: pr?.earned_run ?? 0,
      hitsAllowed: pr?.hits_allowed ?? 0,
      homeRunsHit: pr?.home_runs_hit ?? 0,
      strikeouts: pr?.strikeouts ?? 0,
      pitchingBaseOnBalls: pr?.base_on_balls ?? 0,
      pitchingHitByPitch: pr?.hit_by_pitch ?? 0,
    });
  },

  reset: () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    set({ ...initialState, date: today });
  },
}));
