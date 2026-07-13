// 「練習と成績のつながり」の自作カードで選べる入力・成績。
// バック側 app/services/insights/catalog.rb とキーを一致させること。

/** 固定入力（コンディション・練習量）。練習メニューは別途 usePracticeMenus から選ぶ。 */
export const INPUT_OPTIONS: { key: string; label: string }[] = [
  { key: "total_swings", label: "素振りの本数" },
  { key: "practice_days", label: "練習した日数" },
  { key: "sleep_hours", label: "睡眠時間" },
  { key: "physical_level", label: "体調の良さ" },
  { key: "energy_level", label: "元気さ（疲れの少なさ）" },
];

/** 成績指標（打撃＋投手）。 */
export const METRIC_OPTIONS: {
  key: string;
  label: string;
  side: "batting" | "pitching";
}[] = [
  { key: "batting_average", label: "打率", side: "batting" },
  { key: "on_base_percentage", label: "出塁率", side: "batting" },
  { key: "slugging_percentage", label: "長打率", side: "batting" },
  { key: "ops", label: "OPS", side: "batting" },
  { key: "era", label: "防御率", side: "pitching" },
  { key: "whip", label: "WHIP", side: "pitching" },
  { key: "bb_per9", label: "与四球率", side: "pitching" },
];
