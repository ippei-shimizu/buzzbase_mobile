import type { AppearanceType, Position, Team } from "../../types/gameRecord";
import type { Season } from "../../types/season";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  Platform,
  Modal,
} from "react-native";
import {
  PatternSelector,
  type RecordPattern,
} from "@components/game-record/PatternSelector";
import { StadiumSelect } from "@components/game-record/StadiumSelect";
import { Button } from "@components/ui/Button";
import { SelectPicker } from "@components/ui/SelectPicker";
import {
  APPEARANCE_TYPE_OPTIONS,
  isLineupRequired,
} from "@constants/appearanceType";

/**
 * Step1 試合情報フォームのフィールド単位エラー型。
 * 必須項目のキーごとに人間向けメッセージを保持する。
 * `errors` 配列ではなく構造化することで、フィールド近傍にメッセージを配置できる。
 */
export type GameInfoFieldErrors = Partial<
  Record<
    | "date"
    | "myTeamName"
    | "opponentTeamName"
    | "myTeamScore"
    | "opponentTeamScore"
    | "battingOrder"
    | "defensivePosition",
    string
  >
>;

interface Props {
  date: string;
  matchType: string;
  myTeamName: string;
  myTeamId: number | null;
  opponentTeamName: string;
  opponentTeamId: number | null;
  myTeamScore: number | null;
  opponentTeamScore: number | null;
  battingOrder: string;
  defensivePosition: string;
  memo: string;
  tournamentName: string;
  tournamentId: number | null;
  tournaments: { id: number; name: string }[];
  seasonName: string;
  seasons: Season[];
  teams: Team[];
  positions: Position[];
  inningFormat: number;
  appearanceType: AppearanceType;
  // 球場は任意項目。
  stadiumId: number | null;
  stadiumName: string;
  isSubmitting: boolean;
  fieldErrors: GameInfoFieldErrors;
  onFieldChange: (field: string, value: string | number | null) => void;
  onSubmit: () => void;
  // appearanceType !== "no_play" の場合に末尾へ表示する記録パターン選択 UI のハンドラ。
  // 編集モードでは未指定にして既存の onSubmit Button を表示する。
  onPatternSelect?: (pattern: RecordPattern) => void;
}

// 打順の選択肢。1〜9番／DH に加え、代打・代走・途中出場・未出場ケース向けに「なし」を先頭に追加。
const BATTING_ORDERS = [
  { label: "なし", value: "" },
  ...Array.from({ length: 10 }, (_, i) => ({
    label: i === 9 ? "DH" : `${i + 1}番`,
    value: i === 9 ? "DH" : String(i + 1),
  })),
];

/**
 * "YYYY-MM-DD" 形式のローカル日付文字列を Date オブジェクトに変換する。
 * 不正な値の場合は今日の日付を返す。
 */
function parseDateString(value: string): Date {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return new Date();
  const [, y, m, d] = matched;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/** Date オブジェクトを "YYYY-MM-DD" 形式の文字列に変換する。 */
function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" を画面表示用の "YYYY/MM/DD" に変換する。 */
function displayDateString(value: string): string {
  return value ? value.replaceAll("-", "/") : "";
}

function FormRow({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formRow}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.formInput}>
        {children}
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      </View>
    </View>
  );
}

export function GameInfoForm({
  date,
  matchType,
  myTeamName,
  myTeamId: _myTeamId,
  opponentTeamName,
  opponentTeamId: _opponentTeamId,
  myTeamScore,
  opponentTeamScore,
  battingOrder,
  defensivePosition,
  memo,
  tournamentName,
  tournamentId: _tournamentId,
  tournaments,
  seasonName,
  seasons,
  teams,
  positions,
  inningFormat,
  appearanceType,
  stadiumId: _stadiumId,
  stadiumName,
  isSubmitting,
  fieldErrors,
  onFieldChange,
  onSubmit,
  onPatternSelect,
}: Props) {
  const [showMyTeamSuggestions, setShowMyTeamSuggestions] = useState(false);
  const [showOpponentTeamSuggestions, setShowOpponentTeamSuggestions] =
    useState(false);
  const [showTournamentSuggestions, setShowTournamentSuggestions] =
    useState(false);
  const [showSeasonSuggestions, setShowSeasonSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // 「先発」「途中出場」のときだけ打順／守備位置を必須にする。
  // 代打／代走／未出場 を選んだ瞬間に打順／守備位置を「なし」（空文字）に自動セットして、
  // 必須ラベルも消す。
  const lineupRequired = isLineupRequired(appearanceType);

  const handleAppearanceTypeChange = (next: AppearanceType) => {
    onFieldChange("appearanceType", next);
    if (!isLineupRequired(next)) {
      onFieldChange("battingOrder", "");
      onFieldChange("defensivePosition", "");
    }
  };

  /**
   * DateTimePicker からの日付変更ハンドラ。
   * Android はダイアログ形式なので即時クローズし、iOS はモーダルでユーザーが「完了」するまで開いたままにする。
   */
  const handleDateChange = (
    _event: DateTimePickerEvent,
    selected?: Date | undefined,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selected) {
      onFieldChange("date", formatDateString(selected));
    }
  };

  const filteredMyTeams = useMemo(
    () =>
      myTeamName.length > 0
        ? teams.filter((t) =>
            t.name.toLowerCase().includes(myTeamName.toLowerCase()),
          )
        : [],
    [myTeamName, teams],
  );

  const filteredOpponentTeams = useMemo(
    () =>
      opponentTeamName.length > 0
        ? teams.filter((t) =>
            t.name.toLowerCase().includes(opponentTeamName.toLowerCase()),
          )
        : [],
    [opponentTeamName, teams],
  );

  const filteredTournaments = useMemo(
    () =>
      tournamentName.length > 0
        ? tournaments.filter((t) =>
            t.name.toLowerCase().includes(tournamentName.toLowerCase()),
          )
        : [],
    [tournamentName, tournaments],
  );

  const filteredSeasons = useMemo(
    () =>
      seasonName.length > 0
        ? seasons.filter((s) =>
            s.name.toLowerCase().includes(seasonName.toLowerCase()),
          )
        : [],
    [seasonName, seasons],
  );

  // 代打／代走／途中出場／未出場のときに守備位置を「なし」（未選択）にできるよう、
  // 先頭に空値の選択肢を入れる。先発の必須バリデーションは Step1 画面側で値の有無を見て行う。
  const positionItems = [
    { label: "なし", value: "" },
    ...positions.map((p) => ({ label: p.name, value: p.name })),
  ];

  const renderTeamSuggestions = (
    filteredTeams: Team[],
    onSelect: (team: Team) => void,
    show: boolean,
  ) => {
    if (!show || filteredTeams.length === 0) return null;
    return (
      <View style={styles.suggestions}>
        {filteredTeams.slice(0, 5).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.suggestionItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.suggestionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const datePickerValue = parseDateString(date);

  return (
    // 通常の ScrollView を使用。
    // - キーボード表示時の見切れは step1-game-info の KeyboardAvoidingView でボトム余白を確保
    // - 自チーム / 相手チーム / 大会名のサジェストが自動スクロールで隠れないよう、
    //   フォーカス時の auto-scroll は意図的に行わない
    // - メモ欄のみ onFocus → scrollToEnd で末尾までスクロール（要件③）
    <ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.heading}>試合結果を入力しよう！</Text>

      <View style={styles.formCard}>
        {/* 試合日付 */}
        <FormRow label="試合日付" required error={fieldErrors.date}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="試合日付を選択"
          >
            <Text style={styles.inputText}>
              {displayDateString(date) || "YYYY/MM/DD"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        </FormRow>
        {/* iOS はモーダル内でカレンダーUI、Android は OS 標準ダイアログ */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal
            transparent
            animationType="slide"
            visible
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              />
              <View style={styles.datePickerSheet}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDone}>完了</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerBody}>
                  <DateTimePicker
                    value={datePickerValue}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    themeVariant="dark"
                    locale="ja-JP"
                    // BUZZ BASE のメインカラー (#d08000) に揃える
                    accentColor="#d08000"
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.divider} />

        {/* 試合種類 */}
        <FormRow label="試合種類" required>
          <View style={styles.radioGroup}>
            {["公式戦", "オープン戦"].map((type) => (
              <TouchableOpacity
                key={type}
                accessibilityRole="radio"
                accessibilityLabel={type}
                accessibilityState={{ selected: matchType === type }}
                style={styles.radioOption}
                onPress={() => onFieldChange("matchType", type)}
              >
                <View style={styles.radioOuter}>
                  {matchType === type && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* イニング制（7回制 / 9回制） */}
        <FormRow label="イニング制" required>
          <View style={styles.radioGroup}>
            {[
              { label: "9回制", value: 9 },
              { label: "7回制", value: 7 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: inningFormat === opt.value }}
                style={styles.radioOption}
                onPress={() => onFieldChange("inningFormat", opt.value)}
              >
                <View style={styles.radioOuter}>
                  {inningFormat === opt.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* 出場区分（先発 / 途中出場 / 代打 / 代走 / 未出場） */}
        <FormRow label="出場区分" required>
          <View style={styles.appearanceRadioGroup}>
            {APPEARANCE_TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: appearanceType === opt.value }}
                style={styles.radioOption}
                onPress={() => handleAppearanceTypeChange(opt.value)}
              >
                <View style={styles.radioOuter}>
                  {appearanceType === opt.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* 大会名 */}
        <FormRow label="大会名">
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={tournamentName}
              onChangeText={(v) => {
                onFieldChange("tournamentName", v);
                onFieldChange("tournamentId", null);
                setShowTournamentSuggestions(true);
              }}
              onFocus={() => setShowTournamentSuggestions(true)}
              placeholder="大会名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {showTournamentSuggestions && filteredTournaments.length > 0 && (
          <>
            <TouchableWithoutFeedback
              onPress={() => {
                setShowTournamentSuggestions(false);
                Keyboard.dismiss();
              }}
            >
              <View style={styles.suggestionsOverlay} />
            </TouchableWithoutFeedback>
            <ScrollView
              style={styles.suggestions}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {filteredTournaments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    onFieldChange("tournamentName", item.name);
                    onFieldChange("tournamentId", item.id);
                    setShowTournamentSuggestions(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.divider} />

        {/* シーズン: 既存選択 / 新規入力どちらにも対応するコンボボックス。
            未選択かつ入力ありの場合は Step1 送信時に新規シーズンを作成する。 */}
        <FormRow label="シーズン">
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={seasonName}
              onChangeText={(v) => {
                onFieldChange("seasonName", v);
                onFieldChange("seasonId", null);
                setShowSeasonSuggestions(true);
              }}
              onFocus={() => setShowSeasonSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSeasonSuggestions(false), 200)
              }
              placeholder="シーズン名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {showSeasonSuggestions && filteredSeasons.length > 0 && (
          <>
            <TouchableWithoutFeedback
              onPress={() => {
                setShowSeasonSuggestions(false);
                Keyboard.dismiss();
              }}
            >
              <View style={styles.suggestionsOverlay} />
            </TouchableWithoutFeedback>
            <ScrollView
              style={styles.suggestions}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {filteredSeasons.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    onFieldChange("seasonName", item.name);
                    onFieldChange("seasonId", item.id);
                    setShowSeasonSuggestions(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.divider} />

        {/* 自チーム */}
        <FormRow label="自チーム" required error={fieldErrors.myTeamName}>
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={myTeamName}
              onChangeText={(v) => {
                onFieldChange("myTeamName", v);
                onFieldChange("myTeamId", null);
                setShowMyTeamSuggestions(true);
              }}
              onFocus={() => setShowMyTeamSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowMyTeamSuggestions(false), 200)
              }
              placeholder="チーム名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {renderTeamSuggestions(
          filteredMyTeams,
          (team) => {
            onFieldChange("myTeamName", team.name);
            onFieldChange("myTeamId", team.id);
            setShowMyTeamSuggestions(false);
          },
          showMyTeamSuggestions,
        )}

        <View style={styles.divider} />

        {/* 相手チーム */}
        <FormRow
          label="相手チーム"
          required
          error={fieldErrors.opponentTeamName}
        >
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={opponentTeamName}
              onChangeText={(v) => {
                onFieldChange("opponentTeamName", v);
                onFieldChange("opponentTeamId", null);
                setShowOpponentTeamSuggestions(true);
              }}
              onFocus={() => setShowOpponentTeamSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowOpponentTeamSuggestions(false), 200)
              }
              placeholder="相手のチーム名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {renderTeamSuggestions(
          filteredOpponentTeams,
          (team) => {
            onFieldChange("opponentTeamName", team.name);
            onFieldChange("opponentTeamId", team.id);
            setShowOpponentTeamSuggestions(false);
          },
          showOpponentTeamSuggestions,
        )}

        <View style={styles.divider} />

        {/* 球場（任意項目）。検索 → 既存マスタから選択 or 新規追加。 */}
        <StadiumSelect
          stadiumId={_stadiumId}
          stadiumName={stadiumName}
          onSelect={({ id, name }) => {
            onFieldChange("stadiumId", id);
            onFieldChange("stadiumName", name);
          }}
        />

        <View style={styles.divider} />

        {/* 点数（0-0 完封試合も有効値のため、空文字 → null として未入力を区別する） */}
        <FormRow
          label="点数"
          required
          error={fieldErrors.myTeamScore || fieldErrors.opponentTeamScore}
        >
          <View style={styles.scoreRow}>
            <RNTextInput
              style={styles.scoreInput}
              value={myTeamScore !== null ? String(myTeamScore) : ""}
              onChangeText={(v) => {
                if (v === "") {
                  onFieldChange("myTeamScore", null);
                  return;
                }
                const parsed = parseInt(v, 10);
                if (!Number.isNaN(parsed)) {
                  onFieldChange("myTeamScore", parsed);
                }
              }}
              placeholder="自分"
              placeholderTextColor="#71717A"
              keyboardType="number-pad"
            />
            <Text style={styles.scoreSeparator}>対</Text>
            <RNTextInput
              style={styles.scoreInput}
              value={
                opponentTeamScore !== null ? String(opponentTeamScore) : ""
              }
              onChangeText={(v) => {
                if (v === "") {
                  onFieldChange("opponentTeamScore", null);
                  return;
                }
                const parsed = parseInt(v, 10);
                if (!Number.isNaN(parsed)) {
                  onFieldChange("opponentTeamScore", parsed);
                }
              }}
              placeholder="相手"
              placeholderTextColor="#71717A"
              keyboardType="number-pad"
            />
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* 打順。先発・途中出場のときだけ必須。代打/代走/未出場のときは「なし」が自動選択される。 */}
        <FormRow
          label="打順"
          required={lineupRequired}
          error={fieldErrors.battingOrder}
        >
          <SelectPicker
            items={BATTING_ORDERS}
            selectedValue={battingOrder}
            onSelect={(v) => onFieldChange("battingOrder", String(v))}
            compact
          />
        </FormRow>

        <View style={styles.divider} />

        {/* 守備位置。先発・途中出場のときだけ必須。代打/代走/未出場のときは「なし」が自動選択される。 */}
        <FormRow
          label="守備位置"
          required={lineupRequired}
          error={fieldErrors.defensivePosition}
        >
          <SelectPicker
            items={positionItems}
            selectedValue={defensivePosition}
            onSelect={(v) => onFieldChange("defensivePosition", String(v))}
            compact
          />
        </FormRow>
      </View>

      {/* メモ */}
      <View style={styles.memoSection}>
        <Text style={styles.memoLabel}>メモ</Text>
        <RNTextInput
          style={styles.memoInput}
          multiline
          value={memo}
          onChangeText={(v) => onFieldChange("memo", v)}
          placeholder="試合の中で気づいたこと、感じたことをメモしておこう！"
          placeholderTextColor="#71717A"
          // フォーカス時に末尾までスクロールしてメモ欄をキーボードの上に表示する（要件③）。
          // 親の KeyboardAvoidingView がボトム余白を確保するため、scrollToEnd と組み合わせて見切れを防ぐ。
          onFocus={() => {
            setTimeout(() => {
              scrollRef.current?.scrollToEnd?.();
            }, 100);
          }}
        />
      </View>

      {appearanceType === "no_play" || !onPatternSelect ? (
        <Button
          title={
            appearanceType === "no_play" ? "試合結果まとめへ" : "打撃成績入力へ"
          }
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginBottom: 40 }}
        />
      ) : (
        <PatternSelector onSelect={onPatternSelect} disabled={isSubmitting} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  heading: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  formLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    width: 90,
  },
  required: {
    color: "#EF4444",
  },
  formInput: {
    flex: 1,
  },
  fieldError: {
    marginTop: 6,
    color: "#F31260",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#3f3f46",
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  // 日付入力はカレンダーアイコンを右端に並べる
  dateInput: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    color: "#F4F4F4",
    fontSize: 15,
  },
  comboBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingRight: 12,
  },
  comboInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  // 出場区分は選択肢が5つあり、横一列だと画面幅に収まらないため
  // 折り返しを許可し、行間と列間を調整する。
  appearanceRadioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#71717A",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d08000",
  },
  radioLabel: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
    textAlign: "center",
  },
  scoreSeparator: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionsOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  suggestions: {
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 8,
    maxHeight: 200,
    zIndex: 10,
    // iOS の View はデフォルト overflow: visible で、ScrollView 化していても
    // 角丸を効かせるため明示的に切る。
    overflow: "hidden",
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  suggestionText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  memoSection: {
    marginBottom: 20,
  },
  memoLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  memoInput: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  datePickerSheet: {
    backgroundColor: "#2E2E2E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  // DateTimePicker 自体は左寄せで描画されるため、シート側で水平パディングを与えて中央揃えにする。
  datePickerBody: {
    paddingHorizontal: 12,
  },
  datePickerDone: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "600",
  },
});
