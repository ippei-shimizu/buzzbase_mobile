import type {
  MediaAttachment,
  StagedMediaAsset,
} from "../../types/mediaAttachment";
import type { NoteInput } from "../../types/note";
import type { ReflectionTemplate } from "../../types/reflectionTemplate";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellOverlay } from "@components/pro/ProUpsellOverlay";
import { useEntitlement } from "@hooks/useEntitlement";
import { useFilteredGameResults } from "@hooks/useGameResults";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { formatJaFullDate } from "@utils/formatDate";
import { buildMemoJson, buildReflectionMemoText } from "../../types/note";
import { MediaAttachmentList } from "./MediaAttachmentList";
import { MediaPicker } from "./MediaPicker";
import { ReflectionTemplateSection } from "./ReflectionTemplateSection";
import { StagedMediaList } from "./StagedMediaList";
import { TagSection } from "./TagSection";

type OpenPicker = "none" | "practice" | "game";

export interface NoteFormInitial {
  title?: string;
  memo?: string;
  date?: string;
  practiceSessionId?: number | null;
  gameResultIds?: number[];
  improvementThemeIds?: number[];
  reflectionTemplateId?: number | null;
  reflectionAnswers?: { question: string; answer: string }[];
  tagIds?: number[];
}

interface Props {
  initial?: NoteFormInitial;
  /** 練習フローから来た時など、日付が確定済みのケースでは日付ピッカーを隠す。 */
  showDatePicker?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  /**
   * 保存中バナーに出す文言。動画の圧縮・アップロードは数十秒かかることがあるため、
   * 呼び出し側が進捗（何件目か）を渡して「固まった」と誤解されるのを防ぐ。
   */
  submittingMessage?: string;
  /**
   * stagedMediaは新規作成時にローカルで選択済み（未アップロード）のメディア。
   * baseball_note_idが未確定のため、呼び出し側でノート作成成功後にまとめてアップロードする。
   * 編集時（noteIdあり）は常に空配列。
   */
  onSubmit: (
    input: NoteInput,
    stagedMedia: StagedMediaAsset[],
  ) => Promise<void> | void;
  /** 編集時はテンプレ変更で回答が消えるのを防ぐため、テンプレ選択を固定する。 */
  templateLocked?: boolean;
  /**
   * 保存済みノートのID。未指定（新規作成中）はメディアをアップロードせずローカルで
   * 保持し、保存成功後に呼び出し側でアップロードする（baseball_note_idが必須のため）。
   */
  noteId?: number;
  mediaAttachments?: MediaAttachment[];
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
  submittingMessage,
  onSubmit,
  templateLocked = false,
  noteId,
  mediaAttachments = [],
}: Props) {
  const { sessions } = usePracticeSessions();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [date, setDate] = useState<Date>(() =>
    parseDateString(initial?.date ?? todayString()),
  );
  const [showNoteDate, setShowNoteDate] = useState(false);
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(
    initial?.practiceSessionId ?? null,
  );
  const [gameResultIds, setGameResultIds] = useState<number[]>(
    initial?.gameResultIds ?? [],
  );
  const [isGamePaywallOpen, setGamePaywallOpen] = useState(false);
  const [improvementThemeIds, setImprovementThemeIds] = useState<number[]>(
    initial?.improvementThemeIds ?? [],
  );
  const [reflectionTemplateId, setReflectionTemplateId] = useState<
    number | null
  >(initial?.reflectionTemplateId ?? null);
  const [tagIds, setTagIds] = useState<number[]>(initial?.tagIds ?? []);
  const [isTagPaywallOpen, setTagPaywallOpen] = useState(false);
  const [stagedMedia, setStagedMedia] = useState<StagedMediaAsset[]>([]);
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

  const gameLabelFor = (gameResultId: number): string | null => {
    const game = gameResults.find(
      (item) => item.game_result_id === gameResultId,
    );
    if (!game) return null;
    return `${formatJaFullDate(game.match_result.date_and_time.slice(0, 10))} vs ${game.match_result.opponent_team_name}`;
  };

  const filteredSessions = practiceFilter
    ? sessions.filter((item) => item.logged_on === toDateString(practiceFilter))
    : sessions.slice(0, 15);

  const selectableGameResults = gameResults.filter(
    (game) => !gameResultIds.includes(game.game_result_id),
  );

  const reflectionAnswers = templateQuestions
    .map((question) => ({ question, answer: (answers[question] ?? "").trim() }))
    .filter((item) => item.answer.length > 0);

  const handleSelectTemplate = (template: ReflectionTemplate | null) => {
    setReflectionTemplateId(template?.id ?? null);
    setTemplateQuestions(template?.questions ?? []);
  };

  const handleChangeAnswer = (question: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [question]: answer }));

  const handleOpenGamePicker = () => {
    // 無料は1件まで。2件目以降を追加しようとしたら Pro 訴求。
    if (
      gameResultIds.length >= 1 &&
      !hasEntitlement("multi_game_result_notes")
    ) {
      setGamePaywallOpen(true);
      return;
    }
    togglePicker("game");
  };

  const handleSelectGame = (gameResultId: number) => {
    setGameResultIds((prev) =>
      prev.includes(gameResultId) ? prev : [...prev, gameResultId],
    );
    setOpenPicker("none");
  };

  const handleRemoveGame = (gameResultId: number) =>
    setGameResultIds((prev) => prev.filter((id) => id !== gameResultId));

  const handleSubmit = async () => {
    // 自由メモ or テンプレ回答のどちらかがあれば保存できる。
    const hasContent = memo.trim().length > 0 || reflectionAnswers.length > 0;
    if (!hasContent) {
      Alert.alert("メモか振り返りを入力してください");
      return;
    }
    // 一覧プレビュー用に、メモ未入力ならテンプレ回答からメモ本文を合成する。
    const memoText = memo.trim() || buildReflectionMemoText(reflectionAnswers);
    await onSubmit(
      {
        title: title.trim() || null,
        date: toDateString(date),
        memo: buildMemoJson(memoText),
        practice_session_id: practiceSessionId,
        game_result_ids: gameResultIds,
        improvement_theme_ids: improvementThemeIds,
        reflection_template_id: reflectionTemplateId,
        reflection_answers: reflectionAnswers,
        // タグ編集UIは無料ユーザーには表示しないため、その場合は tag_ids キー自体を
        // 送らず既存タグを維持する（back 側は未送信を「変更なし」として扱う）。
        ...(hasEntitlement("note_tags") ? { tag_ids: tagIds } : {}),
      },
      stagedMedia,
    );
  };

  return (
    <View style={styles.container}>
      {isSubmitting ? (
        <View
          style={styles.savingBanner}
          accessibilityRole="progressbar"
          accessibilityLabel={submittingMessage ?? "保存中"}
        >
          <ActivityIndicator size="small" color="#d08000" />
          <Text style={styles.savingBannerText}>
            {submittingMessage ?? "保存中..."}
          </Text>
        </View>
      ) : null}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
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

        <Text style={styles.label}>メディア（任意）</Text>
        {noteId != null ? (
          <>
            <MediaPicker baseballNoteId={noteId} />
            <MediaAttachmentList
              attachments={mediaAttachments}
              editable
              noteId={noteId}
            />
          </>
        ) : (
          <>
            <MediaPicker
              onStage={(asset) => setStagedMedia((prev) => [...prev, asset])}
            />
            <StagedMediaList
              assets={stagedMedia}
              onRemove={(localId) =>
                setStagedMedia((prev) =>
                  prev.filter((item) => item.localId !== localId),
                )
              }
              onUpdateMemo={(localId, memo) =>
                setStagedMedia((prev) =>
                  prev.map((item) =>
                    item.localId === localId ? { ...item, memo } : item,
                  ),
                )
              }
              onUpdateUri={(localId, uri, previewUri) =>
                setStagedMedia((prev) =>
                  prev.map((item) =>
                    item.localId === localId
                      ? { ...item, uri, previewUri }
                      : item,
                  ),
                )
              }
            />
          </>
        )}

        <ReflectionTemplateSection
          selectedTemplateId={reflectionTemplateId}
          answers={answers}
          onSelectTemplate={handleSelectTemplate}
          onChangeAnswer={handleChangeAnswer}
          locked={templateLocked}
        />

        <Text style={styles.label}>タグ（任意・複数選択可）</Text>
        <ProUpsellOverlay
          unlocked={hasEntitlement("note_tags")}
          loading={isProLoading}
          feature="note_tags"
          onPressCta={() => setTagPaywallOpen(true)}
        >
          <TagSection
            selectedIds={tagIds}
            onChange={setTagIds}
            disabled={!hasEntitlement("note_tags")}
            showLabel={false}
          />
        </ProUpsellOverlay>
        <PaywallModal
          isOpen={isTagPaywallOpen}
          onClose={() => setTagPaywallOpen(false)}
          feature="note_tags"
        />

        <Text style={styles.label}>紐付け（任意）</Text>

        <ThemePickerField
          selectedThemeIds={improvementThemeIds}
          onChange={setImprovementThemeIds}
        />

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => togglePicker("practice")}
        >
          <Ionicons name="barbell-outline" size={18} color="#d08000" />
          <Text style={styles.linkButtonText}>
            {practiceLabel ??
              (practiceSessionId != null
                ? "練習記録に紐付け済み"
                : "練習記録に紐付け")}
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
                  <Text style={styles.pickerRowDate}>
                    {formatJaFullDate(session.logged_on)}
                  </Text>
                  {session.practice_logs.length > 0 ? (
                    <Text style={styles.pickerRowMenus} numberOfLines={1}>
                      {session.practice_logs
                        .map((log) => log.menu_name)
                        .join(", ")}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        {gameResultIds.map((gameResultId) => (
          <View key={gameResultId} style={styles.linkButton}>
            <Ionicons name="baseball-outline" size={18} color="#d08000" />
            <Text style={styles.linkButtonText} numberOfLines={1}>
              {gameLabelFor(gameResultId) ?? "試合に紐付け済み"}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveGame(gameResultId)}>
              <Ionicons name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleOpenGamePicker}
        >
          <Ionicons name="baseball-outline" size={18} color="#d08000" />
          <Text style={styles.linkButtonText}>
            {gameResultIds.length > 0
              ? "試合をもう1件追加"
              : "試合記録に紐付け"}
          </Text>
          <Ionicons
            name={openPicker === "game" ? "chevron-up" : "chevron-down"}
            size={18}
            color="#A1A1AA"
          />
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
            {selectableGameResults.length === 0 ? (
              <Text style={styles.pickerEmpty}>試合記録がありません</Text>
            ) : (
              selectableGameResults.slice(0, 15).map((game) => (
                <TouchableOpacity
                  key={game.game_result_id}
                  style={styles.pickerRow}
                  onPress={() => handleSelectGame(game.game_result_id)}
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
        <PaywallModal
          isOpen={isGamePaywallOpen}
          onClose={() => setGamePaywallOpen(false)}
          feature="multi_game_result_notes"
          contextMessage="無料プランでは1つのノートに試合を1件まで紐付けられるため、追加できません。"
        />

        <TouchableOpacity
          style={[
            styles.saveButton,
            (isSubmitting || isProLoading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isProLoading}
        >
          <Text style={styles.saveButtonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#424242",
    borderBottomWidth: 1,
    borderBottomColor: "#5A5A5A",
  },
  savingBannerText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
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
  pickerRowDate: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
  pickerRowMenus: { color: "#A1A1AA", fontSize: 12, marginTop: 3 },
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
