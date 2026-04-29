import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NoteForm } from "@components/baseball-notes/NoteForm";
import { useUpdateBaseballNote } from "@hooks/useBaseballNoteMutations";
import { useBaseballNote } from "@hooks/useBaseballNotes";
import { textToSlateMemo, slateMemoToText } from "@utils/slateUtils";

export default function NoteEditScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = id ? Number(id) : undefined;
  const { note, isLoading } = useBaseballNote(noteId);
  const { updateNote, isUpdating } = useUpdateBaseballNote();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");
  const [initialized, setInitialized] = useState(false);

  const initialMemo = useMemo(
    () => (note ? slateMemoToText(note.memo) : ""),
    [note],
  );

  useEffect(() => {
    if (note && !initialized) {
      setTitle(note.title);
      setDate(note.date);
      setMemo(initialMemo);
      setInitialized(true);
    }
  }, [note, initialized, initialMemo]);

  const isDirty =
    initialized &&
    !!note &&
    (title !== note.title || date !== note.date || memo !== initialMemo);
  const skipGuardRef = useRef(false);

  usePreventRemove(isDirty, ({ data }) => {
    if (skipGuardRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    Alert.alert("変更を破棄しますか？", "編集中の内容は失われます。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "破棄する",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

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
      skipGuardRef.current = true;
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
          isSaving={isUpdating}
          onChangeTitle={setTitle}
          onChangeDate={setDate}
          onChangeMemo={setMemo}
          onSave={handleSave}
          saveLabel="保存"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
