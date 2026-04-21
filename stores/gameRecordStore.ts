import { create } from "zustand";
import type { BattingBox } from "../types/gameRecord";
import type { GameResult } from "../types/gameResult";
import { getResultText } from "@constants/battingData";

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
  tournamentId: number | null;
  tournamentName: string;
  date: string;
  matchType: string;
  myTeamName: string;
  myTeamId: number | null;
  opponentTeamName: string;
  opponentTeamId: number | null;
  myTeamScore: number;
  opponentTeamScore: number;
  battingOrder: string;
  defensivePosition: string;
  memo: string;

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
  tournamentId: null,
  tournamentName: "",
  date: (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })(),
  matchType: "練習試合",
  myTeamName: "",
  myTeamId: null,
  opponentTeamName: "",
  opponentTeamId: null,
  myTeamScore: 0,
  opponentTeamScore: 0,
  battingOrder: "1",
  defensivePosition: "",
  memo: "",

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

  updateBattingBoxResult: (index, resultId) => {
    const boxes = get().battingBoxes.map((box, i) => {
      if (i !== index) return box;
      return {
        ...box,
        result: resultId,
        text: getResultText(box.position, resultId),
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

      tournamentId: mr.tournament_id,
      tournamentName: mr.tournament_name ?? "",
      date: mr.date_and_time.split("T")[0],
      matchType: mr.match_type,
      myTeamName: mr.my_team_name ?? "",
      myTeamId: mr.my_team_id,
      opponentTeamName: mr.opponent_team_name,
      opponentTeamId: mr.opponent_team_id,
      myTeamScore: mr.my_team_score,
      opponentTeamScore: mr.opponent_team_score,
      battingOrder: mr.batting_order,
      defensivePosition: mr.defensive_position,
      memo: mr.memo ?? "",

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
