import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { NoteForm } from "@components/baseball-notes/NoteForm";
import { useUpdateBaseballNote } from "@hooks/useBaseballNoteMutations";
import { useBaseballNote } from "@hooks/useBaseballNotes";
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
