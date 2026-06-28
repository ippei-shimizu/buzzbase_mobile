import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { useNote, useNoteMutations } from "@hooks/useNotes";
import { extractMemoText } from "../../types/note";

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

  return (
    <NoteForm
      initial={{
        title: note.title ?? "",
        memo: extractMemoText(note.memo),
        date: note.date,
        practiceSessionId: note.practice_session_id,
        gameResultId: note.game_result_id,
      }}
      submitLabel="更新"
      isSubmitting={isUpdating}
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
