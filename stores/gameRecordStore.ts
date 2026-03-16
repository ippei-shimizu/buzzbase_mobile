import { create } from "zustand";

interface GameRecordState {
  // IDs
  userId: number | null;
  gameResultId: number | null;
  matchResultId: number | null;
  battingAverageId: number | null;
  pitchingResultId: number | null;

  // Step1: 試合情報
  seasonId: number | null;
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

  // Step2: 打撃成績（全デフォルト0）
  plateAppearances: number;
  timesAtBat: number;
  hit: number;
  twoBaseHit: number;
  threeBaseHit: number;
  homeRun: number;
  totalBases: number;
  runsBattedIn: number;
  run: number;
  strikeOut: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacrificeHit: number;
  sacrificeFly: number;
  stealingBase: number;
  caughtStealing: number;
  atBats: number;
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
  computeTotalBases: () => void;
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

  plateAppearances: 0,
  timesAtBat: 0,
  hit: 0,
  twoBaseHit: 0,
  threeBaseHit: 0,
  homeRun: 0,
  totalBases: 0,
  runsBattedIn: 0,
  run: 0,
  strikeOut: 0,
  baseOnBalls: 0,
  hitByPitch: 0,
  sacrificeHit: 0,
  sacrificeFly: 0,
  stealingBase: 0,
  caughtStealing: 0,
  atBats: 0,
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

  computeTotalBases: () => {
    const s = get();
    const singles = s.hit - s.twoBaseHit - s.threeBaseHit - s.homeRun;
    const total =
      Math.max(0, singles) +
      s.twoBaseHit * 2 +
      s.threeBaseHit * 3 +
      s.homeRun * 4;
    set({ totalBases: total });
  },

  computeInningsPitched: () => {
    const s = get();
    return s.inningsPitchedWhole + s.inningsPitchedFraction / 3;
  },

  reset: () => set(initialState),
}));
