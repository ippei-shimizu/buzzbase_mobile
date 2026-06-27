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
import { useGameResults } from "@hooks/useGameResults";
import { useNoteMutations } from "@hooks/useNotes";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { buildMemoJson } from "../../types/note";

type OpenPicker = "none" | "practice" | "game";

const todayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function NoteNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    practiceSessionId?: string;
    gameResultId?: string;
    date?: string;
  }>();
  const { createNote, isCreating } = useNoteMutations();
  const { sessions } = usePracticeSessions();
  const { gameResults } = useGameResults();

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(
    params.practiceSessionId ? Number(params.practiceSessionId) : null,
  );
  const [gameResultId, setGameResultId] = useState<number | null>(
    params.gameResultId ? Number(params.gameResultId) : null,
  );
  const [openPicker, setOpenPicker] = useState<OpenPicker>("none");

  const date = params.date ?? todayString();

  const practiceLabel = (() => {
    const session = sessions.find((item) => item.id === practiceSessionId);
    return session ? `${session.logged_on} の練習` : null;
  })();

  const gameLabel = (() => {
    const game = gameResults.find(
      (item) => item.game_result_id === gameResultId,
    );
    if (!game) return null;
    return `${game.match_result.date_and_time.slice(0, 10)} vs ${game.match_result.opponent_team_name}`;
  })();

  const togglePicker = (picker: OpenPicker) =>
    setOpenPicker((prev) => (prev === picker ? "none" : picker));

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
        practice_session_id: practiceSessionId,
        game_result_id: gameResultId,
      });
      router.back();
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      <Text style={styles.label}>紐付け（任意）</Text>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => togglePicker("practice")}
      >
        <Ionicons name="barbell-outline" size={18} color="#d08000" />
        <Text style={styles.linkButtonText}>
          {practiceLabel ?? "練習記録に紐付け"}
        </Text>
        {practiceSessionId != null ? (
          <TouchableOpacity onPress={() => setPracticeSessionId(null)}>
            <Ionicons name="close-circle" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={openPicker === "practice" ? "chevron-up" : "chevron-down"}
            size={18}
            color="#A1A1AA"
          />
        )}
      </TouchableOpacity>
      {openPicker === "practice" ? (
        <View style={styles.picker}>
          {sessions.length === 0 ? (
            <Text style={styles.pickerEmpty}>練習記録がありません</Text>
          ) : (
            sessions.slice(0, 10).map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.pickerRow}
                onPress={() => {
                  setPracticeSessionId(session.id);
                  setOpenPicker("none");
                }}
              >
                <Text style={styles.pickerText}>
                  {session.logged_on}
                  {session.practice_logs.length > 0
                    ? ` ・ ${session.practice_logs.map((log) => log.menu_name).join(", ")}`
                    : ""}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => togglePicker("game")}
      >
        <Ionicons name="baseball-outline" size={18} color="#d08000" />
        <Text style={styles.linkButtonText}>
          {gameLabel ?? "試合記録に紐付け"}
        </Text>
        {gameResultId != null ? (
          <TouchableOpacity onPress={() => setGameResultId(null)}>
            <Ionicons name="close-circle" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={openPicker === "game" ? "chevron-up" : "chevron-down"}
            size={18}
            color="#A1A1AA"
          />
        )}
      </TouchableOpacity>
      {openPicker === "game" ? (
        <View style={styles.picker}>
          {gameResults.length === 0 ? (
            <Text style={styles.pickerEmpty}>試合記録がありません</Text>
          ) : (
            gameResults.slice(0, 10).map((game) => (
              <TouchableOpacity
                key={game.game_result_id}
                style={styles.pickerRow}
                onPress={() => {
                  setGameResultId(game.game_result_id);
                  setOpenPicker("none");
                }}
              >
                <Text style={styles.pickerText}>
                  {game.match_result.date_and_time.slice(0, 10)} vs{" "}
                  {game.match_result.opponent_team_name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}

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
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  linkButtonText: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  picker: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  pickerRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
  },
  pickerText: { color: "#F4F4F4", fontSize: 14 },
  pickerEmpty: { color: "#A1A1AA", fontSize: 13, padding: 12 },
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
