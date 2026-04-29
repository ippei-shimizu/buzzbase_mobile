import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NoteForm } from "@components/baseball-notes/NoteForm";
import { useCreateBaseballNote } from "@hooks/useBaseballNoteMutations";
import { textToSlateMemo } from "@utils/slateUtils";

export default function NoteCreateScreen() {
  const router = useRouter();
  const { createNote, isCreating } = useCreateBaseballNote();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});
