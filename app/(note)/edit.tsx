import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { useNote, useNoteMutations } from "@hooks/useNotes";
import { extractMemoText, isReflectionMemo } from "../../types/note";

export default function NoteEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Number(id);
  const { note, isLoading } = useNote(noteId);
  const { updateNote, isUpdating } = useNoteMutations();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ノートが見つかりません</Text>
      </View>
    );
  }

  // テンプレ由来（合成済み）メモは自由メモ欄に流し込まず、テンプレ回答を
  // 編集して保存時に再合成させる（二重表示・回答とメモの乖離を防ぐ）。
  const memoText = extractMemoText(note.memo);
  const answers = note.reflection_answers ?? [];
  const editableMemo = isReflectionMemo(memoText, answers) ? "" : memoText;

  return (
    <NoteForm
      initial={{
        title: note.title ?? "",
        memo: editableMemo,
        date: note.date,
        practiceSessionId: note.practice_session_id,
        gameResultIds: note.game_result_ids,
        improvementThemeIds: note.improvement_theme_ids,
        reflectionTemplateId: note.reflection_template_id,
        reflectionAnswers: note.reflection_answers,
        tagIds: note.tags?.map((tag) => tag.id) ?? [],
      }}
      noteId={noteId}
      mediaAttachments={note.media_attachments}
      submitLabel="更新"
      isSubmitting={isUpdating}
      submittingMessage="更新中…"
      templateLocked
      onSubmit={async (input) => {
        try {
          await updateNote({ id: noteId, input });
          router.back();
        } catch {
          Alert.alert("更新に失敗しました");
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
});
