import type { RunnersState } from "../types/plateAppearance";

/**
 * 打席詳細記録の「ランナー状況」選択肢。
 * back `plate_appearances.runners_state` enum と key を 1:1 で揃える。
 * UI の表示順序は試合状況を直感的にスキャンしやすい順（無走者 → 単走者 → 複数走者 → 満塁）にする。
 */
export const RUNNERS_STATE_OPTIONS: readonly {
  key: RunnersState;
  label: string;
}[] = [
  { key: "bases_empty", label: "無走者" },
  { key: "first", label: "一塁" },
  { key: "second", label: "二塁" },
  { key: "third", label: "三塁" },
  { key: "first_second", label: "一・二塁" },
  { key: "first_third", label: "一・三塁" },
  { key: "second_third", label: "二・三塁" },
  { key: "bases_loaded", label: "満塁" },
];
