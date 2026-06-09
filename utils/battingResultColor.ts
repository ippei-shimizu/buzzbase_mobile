/**
 * `batting_result` 文字列（"中安"、"三ゴロ"、"犠飛" 等）から表示色を決める。
 * 試合一覧 / 試合詳細 / 打席一覧で同じ色分けロジックを使うために共通化している。
 *
 * - 安打系（単打 / 二塁打 / 三塁打 / 本塁打）: 赤系 `#f31260`
 * - 犠打 / 犠飛: 青系 `#006fee`
 * - その他: 白 `#F4F4F4`
 */

const HIT_RESULTS = [
  "左安",
  "中安",
  "右安",
  "遊安",
  "投安",
  "一安",
  "二安",
  "三安",
  "左線安",
  "左中安",
  "右中安",
  "右線安",
  "左二",
  "中二",
  "右二",
  "左線二",
  "左中二",
  "右中二",
  "右線二",
  "左三",
  "中三",
  "右三",
  "左線三",
  "左中三",
  "右中三",
  "右線三",
  "左本",
  "中本",
  "右本",
  "左線本",
  "左中本",
  "右中本",
  "右線本",
  "本塁打",
  "安打",
  "二塁打",
  "三塁打",
] as const;

const SACRIFICE_RESULTS = ["犠打", "犠飛", "犠牲"] as const;

export const HIT_RESULT_COLOR = "#f31260";
export const SACRIFICE_RESULT_COLOR = "#006fee";
export const DEFAULT_RESULT_COLOR = "#F4F4F4";

export function getBattingResultColor(result: string): string {
  if (HIT_RESULTS.some((h) => result.includes(h))) return HIT_RESULT_COLOR;
  if (SACRIFICE_RESULTS.some((s) => result.includes(s)))
    return SACRIFICE_RESULT_COLOR;
  return DEFAULT_RESULT_COLOR;
}
