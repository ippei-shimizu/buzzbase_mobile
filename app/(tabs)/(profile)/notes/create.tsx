import React, { useState } from "react";
import { ScrollView, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCreateBaseballNote } from "@hooks/useBaseballNoteMutations";
import { NoteForm } from "@components/baseball-notes/NoteForm";
import { textToSlateMemo } from "@utils/slateUtils";

export default function NoteCreateScreen() {
  const router = useRouter();
  const { createNote, isCreating } = useCreateBaseballNote();

  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [memo, setMemo] = useState("");

  const handleSave = async () => {
    try {
      await createNote({
        title: title.trim(),
        date,
        memo: textToSlateMemo(memo),
      });
      router.back();
    } catch {
      Alert.alert("エラー", "ノートの作成に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <NoteForm
        title={title}
        date={date}
        memo={memo}
        isSaving={isCreating}
        onChangeTitle={setTitle}
        onChangeDate={setDate}
        onChangeMemo={setMemo}
        onSave={handleSave}
        saveLabel="作成"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});
