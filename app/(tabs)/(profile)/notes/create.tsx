import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
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

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
      }}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});
