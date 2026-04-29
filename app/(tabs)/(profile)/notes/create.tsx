import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
  const navigation = useNavigation();
  const { createNote, isCreating } = useCreateBaseballNote();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [memo, setMemo] = useState("");

  const isDirty = title.length > 0 || memo.length > 0;
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
      await createNote({
        title: title.trim(),
        date,
        memo: textToSlateMemo(memo),
      });
      skipGuardRef.current = true;
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
