import { create } from "zustand";
import type { BattingBox } from "../types/gameRecord";
import { getResultText } from "@constants/battingData";

interface GameRecordState {
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
  reset: () => void;
}

const initialState = {
  userId: null,
  gameResultId: null,
  matchResultId: null,
  battingAverageId: null,
  pitchingResultId: null,

  seasonId: null,
  tournamentId: null,
  tournamentName: "",
  date: new Date().toISOString().split("T")[0],
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
    set({ battingBoxes: boxes.length > 0 ? boxes : [{ id: 0, position: 0, result: 0, text: "--" }] });
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

  reset: () => set(initialState),
}));
