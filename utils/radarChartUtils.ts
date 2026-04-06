import type {
  BattingStats,
  PitchingStats,
  RadarAxis,
} from "../types/dashboard";
import { formatRate } from "./formatStats";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizePositive(raw: number, maxRef: number): number {
  return clamp((raw / maxRef) * 100, 0, 100);
}

function normalizeInverse(raw: number, maxRef: number): number {
  return clamp((1 - raw / maxRef) * 100, 0, 100);
}

export function normalizeBattingStats(batting: BattingStats): RadarAxis[] {
  if (!batting.calculated || !batting.aggregate) return [];

  const matches = batting.aggregate.number_of_matches;
  if (matches === 0) return [];

  const { batting_average, iso, ops, bb_per_k } = batting.calculated;
  const stealPerGame = batting.aggregate.stealing_base / matches;

  if (
    batting_average === 0 &&
    iso === 0 &&
    ops === 0 &&
    bb_per_k === 0 &&
    stealPerGame === 0
  ) {
    return [];
  }

  return [
    {
      label: "ミート",
      metric: "打率",
      value: normalizePositive(batting_average, 0.5),
      rawValue: formatRate(batting_average),
      description: "安打数 ÷ 打数。基準: .000〜.500",
    },
    {
      label: "パワー",
      metric: "ISO",
      value: normalizePositive(iso, 0.4),
      rawValue: formatRate(iso),
      description: "長打率 − 打率。純粋な長打力を示す。基準: .000〜.400",
    },
    {
      label: "走力",
      metric: "盗塁/試合",
      value: normalizePositive(stealPerGame, 1.0),
      rawValue: stealPerGame.toFixed(2),
      description: "盗塁数 ÷ 試合数。基準: 0.00〜1.00",
    },
    {
      label: "選球眼",
      metric: "BB/K",
      value: normalizePositive(bb_per_k, 1.0),
      rawValue: bb_per_k.toFixed(2),
      description: "四球 ÷ 三振。高いほど選球眼が良い。基準: 0.00〜1.00",
    },
    {
      label: "総合力",
      metric: "OPS",
      value: normalizePositive(ops, 1.2),
      rawValue: formatRate(ops),
      description: "出塁率 + 長打率。打撃の総合評価。基準: .000〜1.200",
    },
  ];
}

export function normalizePitchingStats(pitching: PitchingStats): RadarAxis[] {
  if (!pitching.calculated) return [];

  const { k_per_nine, bb_per_nine, era, whip, win_percentage } =
    pitching.calculated;

  if (!pitching.aggregate || pitching.aggregate.number_of_appearances === 0) {
    return [];
  }

  return [
    {
      label: "奪三振",
      metric: "K/9",
      value: normalizePositive(k_per_nine, 15),
      rawValue: k_per_nine.toFixed(2),
      description: "9イニングあたりの奪三振数。基準: 0〜15",
    },
    {
      label: "制球力",
      metric: "BB/9",
      value: normalizeInverse(bb_per_nine, 6),
      rawValue: bb_per_nine.toFixed(2),
      description: "9イニングあたりの四球数。低いほど良い。基準: 6.00〜0.00",
    },
    {
      label: "安定感",
      metric: "防御率",
      value: normalizeInverse(era, 9),
      rawValue: era.toFixed(2),
      description: "9イニングあたりの自責点。低いほど良い。基準: 9.00〜0.00",
    },
    {
      label: "被打抑止",
      metric: "WHIP",
      value: normalizeInverse(whip, 2.5),
      rawValue: whip.toFixed(2),
      description: "(被安打 + 四球) ÷ 投球回。低いほど良い。基準: 2.50〜0.00",
    },
    {
      label: "勝負強さ",
      metric: "勝率",
      value: normalizePositive(win_percentage, 1.0),
      rawValue: formatRate(win_percentage),
      description: "勝利 ÷ (勝利 + 敗北)。基準: .000〜1.000",
    },
  ];
}
