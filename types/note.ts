export interface NoteV2 {
  id: number;
  title: string | null;
  date: string;
  memo: string | null;
  memo_preview: string;
  game_result_id: number | null;
  practice_log_id: number | null;
  practice_session_id: number | null;
}

export interface NoteInput {
  title?: string;
  date: string;
  memo: string; // Slate 形式の JSON 文字列
  game_result_id?: number | null;
  practice_log_id?: number | null;
  practice_session_id?: number | null;
}

/** プレーンテキストを Slate 互換の JSON 文字列にする（v1 ノートと表示互換）。 */
export const buildMemoJson = (text: string): string =>
  JSON.stringify([{ type: "paragraph", children: [{ text }] }]);

/** Slate JSON / プレーンテキストからテキストを取り出す。 */
export const extractMemoText = (memo: string | null): string => {
  if (!memo) return "";
  try {
    const data = JSON.parse(memo) as { children: { text: string }[] }[];
    return data.map((p) => p.children.map((c) => c.text).join("")).join("\n");
  } catch {
    return memo;
  }
};
