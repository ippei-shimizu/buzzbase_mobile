import { useNotes } from "./useNotes";

/**
 * 直近ノートの「次やること」系の回答を1件返す。
 * 練習開始時に前回の振り返りを引き継いで表示し、上達ループを閉じるために使う。
 */
export const useNextTodoHint = (): string | null => {
  const { notes } = useNotes();
  for (const note of notes) {
    const answer = note.reflection_answers.find(
      (item) => item.question.includes("次") && item.answer.trim().length > 0,
    );
    if (answer) return answer.answer;
  }
  return null;
};
