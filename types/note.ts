import type { ReflectionAnswer } from "./reflectionTemplate";

export interface NoteV2 {
  id: number;
  title: string | null;
  date: string;
  memo: string | null;
  memo_preview: string;
  game_result_id: number | null;
  practice_log_id: number | null;
  practice_session_id: number | null;
  improvement_theme_id: number | null;
  reflection_template_id: number | null;
  reflection_answers: ReflectionAnswer[];
}

export interface NoteInput {
  title?: string;
  date: string;
  memo: string; // Slate 形式の JSON 文字列
  game_result_id?: number | null;
  practice_log_id?: number | null;
  practice_session_id?: number | null;
  improvement_theme_id?: number | null;
  reflection_template_id?: number | null;
  reflection_answers?: ReflectionAnswer[];
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

/**
 * テンプレ回答からメモ本文を合成する。見出しを【】で囲み、本文を改行下・
 * 回答間を空行で区切る。メモ未入力時の一覧プレビュー本文として使う。
 */
export const buildReflectionMemoText = (answers: ReflectionAnswer[]): string =>
  answers.map((item) => `【${item.question}】\n${item.answer}`).join("\n\n");

/**
 * メモ本文がテンプレ回答から自動合成されたもの（新旧フォーマット）かを判定する。
 * 編集時に合成メモを自由メモ欄へ流し込まないための判別に使う。
 */
export const isReflectionMemo = (
  memoText: string,
  answers: ReflectionAnswer[],
): boolean => {
  if (answers.length === 0) return false;
  const legacy = answers
    .map((item) => `${item.question}: ${item.answer}`)
    .join("\n");
  return memoText === buildReflectionMemoText(answers) || memoText === legacy;
};
