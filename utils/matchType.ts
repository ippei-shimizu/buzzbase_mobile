/**
 * match_type（試合種別）の DB 値と日本語ラベルの相互変換ユーティリティ。
 *
 * バックエンドは "regular" / "open" の英語キーで保存・返却し、
 * UI 上では「公式戦」「オープン戦」と表示する。
 */

/** DB 値 → 日本語ラベルのマップ */
export const MATCH_TYPE_LABELS: Record<string, string> = {
  regular: "公式戦",
  open: "オープン戦",
};

/**
 * match_type の DB 値を日本語ラベルに変換する。
 *
 * @param value `"regular"` / `"open"` / 既に日本語のラベル / `null` / `undefined`
 * @returns 対応する日本語ラベル。未知の値はそのまま返し、`null` / `undefined` の場合は `null`
 */
export function formatMatchTypeLabel(value: string): string;
export function formatMatchTypeLabel(
  value: string | null | undefined,
): string | null;
export function formatMatchTypeLabel(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  return MATCH_TYPE_LABELS[value] ?? value;
}

/** 日本語ラベル → DB 値のマップ（{@link MATCH_TYPE_LABELS} の逆引き） */
const MATCH_TYPE_KEYS: Record<string, string> = Object.fromEntries(
  Object.entries(MATCH_TYPE_LABELS).map(([key, label]) => [label, key]),
);

/**
 * 日本語ラベルを match_type の DB 値に逆変換する。
 * 集計時にロケール非依存のキー（"regular" / "open"）で扱うために使う。
 *
 * @param value `"公式戦"` / `"オープン戦"` / 既に DB 値 / `null` / `undefined`
 * @returns 対応する DB 値。未知の値はそのまま返し、`null` / `undefined` は `null`
 */
export function toMatchTypeKey(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  return MATCH_TYPE_KEYS[value] ?? value;
}

/**
 * フィルタ／ピッカー用の選択肢配列。
 * `FilterDropdown` の `options` プロパティに渡す形式。
 */
export const MATCH_TYPE_OPTIONS: { key: string; label: string }[] = [
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];
