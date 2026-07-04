import type { NoteInput } from "../../types/note";
import type { ReflectionTemplate } from "../../types/reflectionTemplate";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { ThemePickerField } from "@components/improvement-theme/ThemePickerField";
import { useFilteredGameResults } from "@hooks/useGameResults";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { formatJaFullDate } from "@utils/formatDate";
import { buildMemoJson, buildReflectionMemoText } from "../../types/note";
import { ReflectionTemplateSection } from "./ReflectionTemplateSection";

type OpenPicker = "none" | "practice" | "game";

export interface NoteFormInitial {
  title?: string;
  memo?: string;
  date?: string;
  practiceSessionId?: number | null;
  gameResultId?: number | null;
  improvementThemeId?: number | null;
  reflectionTemplateId?: number | null;
  reflectionAnswers?: { question: string; answer: string }[];
}

interface Props {
  initial?: NoteFormInitial;
  /** 練習フローから来た時など、日付が確定済みのケースでは日付ピッカーを隠す。 */
  showDatePicker?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: NoteInput) => Promise<void> | void;
}

const todayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseDateString = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export function NoteForm({
  initial,
  showDatePicker = true,
  submitLabel,
  isSubmitting,
  onSubmit,
}: Props) {
  const { sessions } = usePracticeSessions();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [date, setDate] = useState<Date>(() =>
    parseDateString(initial?.date ?? todayString()),
  );
  const [showNoteDate, setShowNoteDate] = useState(false);
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(
    initial?.practiceSessionId ?? null,
  );
  const [gameResultId, setGameResultId] = useState<number | null>(
    initial?.gameResultId ?? null,
  );
  const [improvementThemeId, setImprovementThemeId] = useState<number | null>(
    initial?.improvementThemeId ?? null,
  );
  const [reflectionTemplateId, setReflectionTemplateId] = useState<
    number | null
  >(initial?.reflectionTemplateId ?? null);
  const [templateQuestions, setTemplateQuestions] = useState<string[]>(() =>
    (initial?.reflectionAnswers ?? []).map((item) => item.question),
  );
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initial?.reflectionAnswers ?? []).map((item) => [
        item.question,
        item.answer,
      ]),
    ),
  );
  const [openPicker, setOpenPicker] = useState<OpenPicker>("none");

  // 練習記録の絞り込み日付。
  const [practiceFilter, setPracticeFilter] = useState<Date | null>(null);
  const [showPracticeFilter, setShowPracticeFilter] = useState(false);

  // 試合の対戦相手検索（300ms デバウンス）。
  const [gameSearch, setGameSearch] = useState("");
  const [debouncedGameSearch, setDebouncedGameSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGameSearch(gameSearch), 300);
    return () => clearTimeout(timer);
  }, [gameSearch]);

  const { gameResults } = useFilteredGameResults({
    year: "通算",
    match_type: "全て",
    search: debouncedGameSearch || undefined,
    sort_by: "date",
    sort_order: "desc",
  });

  const togglePicker = (picker: OpenPicker) =>
    setOpenPicker((prev) => (prev === picker ? "none" : picker));

  const practiceLabel = (() => {
    const session = sessions.find((item) => item.id === practiceSessionId);
    return session ? `${formatJaFullDate(session.logged_on)} の練習` : null;
  })();

  const gameLabel = (() => {
    const game = gameResults.find(
      (item) => item.game_result_id === gameResultId,
    );
    if (!game) return null;
    return `${formatJaFullDate(game.match_result.date_and_time.slice(0, 10))} vs ${game.match_result.opponent_team_name}`;
  })();

  const filteredSessions = practiceFilter
    ? sessions.filter((item) => item.logged_on === toDateString(practiceFilter))
    : sessions.slice(0, 15);

  const reflectionAnswers = templateQuestions
    .map((question) => ({ question, answer: (answers[question] ?? "").trim() }))
    .filter((item) => item.answer.length > 0);

  const handleSelectTemplate = (template: ReflectionTemplate | null) => {
    setReflectionTemplateId(template?.id ?? null);
    setTemplateQuestions(template?.questions ?? []);
  };

  const handleChangeAnswer = (question: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [question]: answer }));

  const handleSubmit = async () => {
    // 自由メモ or テンプレ回答のどちらかがあれば保存できる。
    const hasContent = memo.trim().length > 0 || reflectionAnswers.length > 0;
    if (!hasContent) {
      Alert.alert("メモか振り返りを入力してください");
      return;
    }
    // 一覧プレビュー用に、メモ未入力ならテンプレ回答からメモ本文を合成する。
    const memoText = memo.trim() || buildReflectionMemoText(reflectionAnswers);
    await onSubmit({
      title: title.trim() || undefined,
      date: toDateString(date),
      memo: buildMemoJson(memoText),
      practice_session_id: practiceSessionId,
      game_result_id: gameResultId,
      improvement_theme_id: improvementThemeId,
      reflection_template_id: reflectionTemplateId,
      reflection_answers: reflectionAnswers,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {showDatePicker ? (
        <>
          <Text style={styles.label}>日付</Text>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setShowNoteDate((prev) => !prev)}
          >
            <Text style={styles.dateText}>
              {formatJaFullDate(toDateString(date))}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#A1A1AA" />
          </TouchableOpacity>
          {showNoteDate ? (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              themeVariant="dark"
              accentColor="#d08000"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_event, selected) => {
                setShowNoteDate(false);
                if (selected) setDate(selected);
              }}
            />
          ) : null}
        </>
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

      <ReflectionTemplateSection
        selectedTemplateId={reflectionTemplateId}
        answers={answers}
        onSelectTemplate={handleSelectTemplate}
        onChangeAnswer={handleChangeAnswer}
      />

      <Text style={styles.label}>紐付け（任意）</Text>

      <ThemePickerField
        selectedThemeId={improvementThemeId}
        onChange={setImprovementThemeId}
      />

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
          <TouchableOpacity
            style={styles.filterRow}
            onPress={() => setShowPracticeFilter((prev) => !prev)}
          >
            <Ionicons name="calendar-outline" size={16} color="#A1A1AA" />
            <Text style={styles.filterText}>
              {practiceFilter
                ? `${formatJaFullDate(toDateString(practiceFilter))} で絞り込み中`
                : "日付で絞り込む"}
            </Text>
            {practiceFilter ? (
              <TouchableOpacity onPress={() => setPracticeFilter(null)}>
                <Ionicons name="close-circle" size={16} color="#A1A1AA" />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {showPracticeFilter ? (
            <DateTimePicker
              value={practiceFilter ?? new Date()}
              mode="date"
              maximumDate={new Date()}
              themeVariant="dark"
              accentColor="#d08000"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_event, selected) => {
                setShowPracticeFilter(false);
                if (selected) setPracticeFilter(selected);
              }}
            />
          ) : null}
          {filteredSessions.length === 0 ? (
            <Text style={styles.pickerEmpty}>
              {practiceFilter
                ? "その日の練習記録がありません"
                : "練習記録がありません"}
            </Text>
          ) : (
            filteredSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.pickerRow}
                onPress={() => {
                  setPracticeSessionId(session.id);
                  setOpenPicker("none");
                }}
              >
                <Text style={styles.pickerText}>
                  {formatJaFullDate(session.logged_on)}
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
          {gameLabel ??
            (gameResultId != null ? "試合に紐付け済み" : "試合記録に紐付け")}
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
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#71717A" />
            <TextInput
              style={styles.searchInput}
              placeholder="対戦相手で検索"
              placeholderTextColor="#71717A"
              value={gameSearch}
              onChangeText={setGameSearch}
            />
          </View>
          {gameResults.length === 0 ? (
            <Text style={styles.pickerEmpty}>試合記録がありません</Text>
          ) : (
            gameResults.slice(0, 15).map((game) => (
              <TouchableOpacity
                key={game.game_result_id}
                style={styles.pickerRow}
                onPress={() => {
                  setGameResultId(game.game_result_id);
                  setOpenPicker("none");
                }}
              >
                <Text style={styles.pickerText}>
                  {formatJaFullDate(
                    game.match_result.date_and_time.slice(0, 10),
                  )}{" "}
                  vs {game.match_result.opponent_team_name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.saveButtonText}>{submitLabel}</Text>
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: { color: "#F4F4F4", fontSize: 15 },
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  filterText: { color: "#A1A1AA", fontSize: 13, flex: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  searchInput: { flex: 1, color: "#F4F4F4", fontSize: 14, paddingVertical: 2 },
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
