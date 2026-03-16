import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useBaseballNote } from "@hooks/useBaseballNotes";
import { useUpdateBaseballNote } from "@hooks/useBaseballNoteMutations";
import { NoteForm } from "@components/baseball-notes/NoteForm";
import { textToSlateMemo, slateMemoToText } from "@utils/slateUtils";

export default function NoteEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = id ? Number(id) : undefined;
  const { note, isLoading } = useBaseballNote(noteId);
  const { updateNote, isUpdating } = useUpdateBaseballNote();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (note && !initialized) {
      setTitle(note.title);
      setDate(note.date);
      setMemo(slateMemoToText(note.memo));
      setInitialized(true);
    }
  }, [note, initialized]);

  const handleSave = async () => {
    try {
      await updateNote({
        id: noteId!,
        params: {
          title: title.trim(),
          date,
          memo: textToSlateMemo(memo),
        },
      });
      router.back();
    } catch {
      Alert.alert("エラー", "ノートの更新に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <NoteForm
        title={title}
        date={date}
        memo={memo}
        isSaving={isUpdating}
        onChangeTitle={setTitle}
        onChangeDate={setDate}
        onChangeMemo={setMemo}
        onSave={handleSave}
        saveLabel="保存"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});
