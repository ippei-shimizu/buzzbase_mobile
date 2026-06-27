import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNoteMutations } from "@hooks/useNotes";
import { buildMemoJson } from "../../types/note";

export default function NoteNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    practiceLogId?: string;
    gameResultId?: string;
    date?: string;
    linkLabel?: string;
  }>();
  const { createNote, isCreating } = useNoteMutations();

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const date =
    params.date ??
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    })();

  const handleSave = async () => {
    if (!memo.trim()) {
      Alert.alert("メモを入力してください");
      return;
    }
    try {
      await createNote({
        title: title.trim() || undefined,
        date,
        memo: buildMemoJson(memo.trim()),
        practice_log_id: params.practiceLogId
          ? Number(params.practiceLogId)
          : null,
        game_result_id: params.gameResultId
          ? Number(params.gameResultId)
          : null,
      });
      router.back();
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {params.linkLabel ? (
        <View style={styles.linkRow}>
          <Ionicons name="link-outline" size={14} color="#A1A1AA" />
          <Text style={styles.linkText}>紐付け: {params.linkLabel}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>タイトル（任意）</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: フォームの気づき"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>メモ</Text>
      <TextInput
        style={[styles.input, styles.memoInput]}
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="外角が体の開きで詰まる。右肩を我慢、と指摘された…"
        placeholderTextColor="#71717A"
      />

      <TouchableOpacity
        style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isCreating}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 10,
  },
  linkText: { color: "#A1A1AA", fontSize: 13 },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  memoInput: { minHeight: 140, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
