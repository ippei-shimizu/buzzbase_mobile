import type {
  Goal,
  GoalComparison,
  GoalKind,
  GoalPeriodType,
} from "../../types/goal";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  GOAL_METRIC_CATEGORIES,
  GOAL_METRICS,
  metricExample,
  metricsInCategory,
} from "@constants/goal";
import { useEntitlement } from "@hooks/useEntitlement";
import { useGoalMutations, useGoals } from "@hooks/useGoals";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { useMySeasons } from "@hooks/useSeasons";
import { useTournaments } from "@hooks/useTournaments";

const pad = (value: number): string => String(value).padStart(2, "0");
const dateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 今週（月曜〜日曜）の開始・終了日を返す。
const weekRange = (base: Date): { start: string; end: string } => {
  const day = base.getDay(); // 0=日
  const diffToMonday = day === 0 ? 6 : day - 1;
  const start = new Date(base);
  start.setDate(base.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: dateString(start), end: dateString(end) };
};

const PERIODS: { key: GoalPeriodType; label: string }[] = [
  { key: "weekly", label: "週次" },
  { key: "monthly", label: "月次" },
  { key: "yearly", label: "年間" },
  { key: "custom", label: "カスタム期間" },
  { key: "tournament", label: "大会" },
  { key: "season", label: "シーズン" },
];

const KINDS: { key: GoalKind; label: string }[] = [
  { key: "numeric", label: "数値目標" },
  { key: "qualitative", label: "達成目標" },
  { key: "manual", label: "自由指標" },
];

const COMPARISONS: { key: GoalComparison; label: string }[] = [
  { key: "greater_than", label: "以上" },
  { key: "less_than", label: "以下" },
];

// 目標タイプの説明。選択中のタイプが「何ができる・してくれるか」を上部に表示する。
const KIND_DESCRIPTIONS: Record<GoalKind, string> = {
  numeric:
    "「打率3割」「今月20日練習」のように数字で決めると、記録した成績や練習からアプリが今の数字を自動で計算して、達成までの進み具合を出してくれます。",
  qualitative:
    "「大会で優勝」「レギュラーになる」など数字にできない目標向け。叶ったら「達成」を押すだけで管理できます（数字の入力は不要）。",
  manual:
    "「球速130km/h」「体重を増やす」など、アプリが測れない自分だけの目標を作れます。測った値を入力するたびに、目標までの進み具合が更新されます。",
};

export default function GoalFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals, isLoading } = useGoals();
  const editing = id ? goals.find((goal) => goal.id === Number(id)) : undefined;

  // 編集モードで目標取得待ちの間はスピナー（初期値を正しく埋めるため）。
  if (id && isLoading && !editing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return <GoalForm key={editing?.id ?? "new"} editing={editing} />;
}

/** 作成・編集の共通フォーム。editing があれば編集（種類・シーズン・大会は固定）。 */
function GoalForm({ editing }: { editing?: Goal }) {
  const router = useRouter();
  const { createGoal, isCreating, updateGoal, isUpdating } = useGoalMutations();
  const { seasons } = useMySeasons();
  const { tournaments } = useTournaments();
  const { menus } = usePracticeMenus();
  const { hasEntitlement } = useEntitlement();
  const canSeason = hasEntitlement("season_goals");
  const canTournament = hasEntitlement("tournament_goals");
  const isSaving = isCreating || isUpdating;

  const [kind, setKind] = useState<GoalKind>(editing?.kind ?? "numeric");
  const [periodType, setPeriodType] = useState<GoalPeriodType>(
    editing?.period_type ?? "monthly",
  );
  const [metricKey, setMetricKey] = useState(
    editing?.metric_key ?? GOAL_METRICS[0].key,
  );
  const [practiceMenuId, setPracticeMenuId] = useState<number | null>(
    editing?.practice_menu_id ?? null,
  );
  const [target, setTarget] = useState(
    editing?.target_value != null ? String(editing.target_value) : "",
  );
  // 自由指標（manual）用: 指標名・単位・現在値・条件はユーザーが定義する。
  const [customLabel, setCustomLabel] = useState(
    editing?.custom_metric_label ?? "",
  );
  const [customUnit, setCustomUnit] = useState(editing?.custom_unit ?? "");
  const [manualCurrent, setManualCurrent] = useState(
    editing?.kind === "manual" ? String(editing.manual_current_value) : "",
  );
  const [comparison, setComparison] = useState<GoalComparison>(
    editing?.comparison_type ?? "greater_than",
  );
  const [title, setTitle] = useState(editing?.title ?? "");
  const [seasonId, setSeasonId] = useState<number | null>(
    editing?.season_id ?? null,
  );
  const [tournamentId, setTournamentId] = useState<number | null>(
    editing?.tournament_id ?? null,
  );
  const [deadline, setDeadline] = useState(() => {
    if (editing) return new Date(`${editing.deadline}T00:00:00`);
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date;
  });
  const [showPicker, setShowPicker] = useState(false);
  // カスタム期間の開始日。
  const [startDate, setStartDate] = useState(() =>
    editing?.month_start
      ? new Date(`${editing.month_start}T00:00:00`)
      : new Date(),
  );
  const [showStartPicker, setShowStartPicker] = useState(false);

  const metric =
    GOAL_METRICS.find((item) => item.key === metricKey) ?? GOAL_METRICS[0];

  const isQualitative = kind === "qualitative";
  const isManual = kind === "manual";
  const isMenuMetric =
    !isQualitative && !isManual && metricKey === "menu_practice_days";

  const handleSave = async () => {
    if (isQualitative && !title.trim()) {
      return Alert.alert("目標を入力してください");
    }
    if (isManual && !customLabel.trim()) {
      return Alert.alert("指標名を入力してください");
    }
    if (!isQualitative && !target) {
      return Alert.alert("目標値を入力してください");
    }
    if (isMenuMetric && !practiceMenuId) {
      return Alert.alert("対象の練習メニューを選択してください");
    }
    if (periodType === "season" && !seasonId) {
      return Alert.alert("シーズンを選択してください");
    }
    if (periodType === "tournament" && !tournamentId) {
      return Alert.alert("大会を選択してください");
    }
    if (
      periodType === "custom" &&
      dateString(startDate) > dateString(deadline)
    ) {
      return Alert.alert("終了日は開始日以降にしてください");
    }

    // 期間タイプごとに開始日(month_start)と期限(deadline)を決める。
    // 編集時、monthly/weekly/yearly は現在時刻基準の自動算出だと編集のたびに
    // 対象期間がズレてしまうため、既存の値をそのまま保つ（period_type は編集不可）。
    const range: { start: string | null; end: string } = (() => {
      if (editing && ["monthly", "weekly", "yearly"].includes(periodType)) {
        return { start: editing.month_start, end: editing.deadline };
      }
      const now = new Date();
      const year = now.getFullYear();
      if (periodType === "monthly") {
        return {
          start: `${year}-${pad(now.getMonth() + 1)}-01`,
          end: dateString(new Date(year, now.getMonth() + 1, 0)),
        };
      }
      if (periodType === "weekly") {
        const week = weekRange(now);
        return { start: week.start, end: week.end };
      }
      if (periodType === "yearly") {
        return { start: `${year}-01-01`, end: `${year}-12-31` };
      }
      if (periodType === "custom") {
        return { start: dateString(startDate), end: dateString(deadline) };
      }
      // season / tournament は開始日を持たず、期限のみ。
      return { start: null, end: dateString(deadline) };
    })();

    const numericPart = isManual
      ? {
          custom_metric_label: customLabel.trim(),
          custom_unit: customUnit.trim() || null,
          target_value: Number(target),
          comparison_type: comparison,
          manual_current_value: Number(manualCurrent || 0),
        }
      : {
          metric_key: metricKey,
          target_value: Number(target),
          comparison_type: metric.comparison,
          practice_menu_id: isMenuMetric ? practiceMenuId : null,
        };

    const input = {
      title:
        title.trim() || (isManual ? customLabel.trim() : `${metric.label}目標`),
      kind,
      period_type: periodType,
      season_id: periodType === "season" ? seasonId : null,
      tournament_id: periodType === "tournament" ? tournamentId : null,
      month_start: range.start,
      deadline: range.end,
      // 定性目標は指標・目標値を持たない。
      ...(isQualitative ? {} : numericPart),
    };

    try {
      if (editing) {
        await updateGoal({ id: editing.id, input });
      } else {
        await createGoal(input);
      }
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert("Pro プラン", "この目標は Pro プランで設定できます", [
          { text: "閉じる", style: "cancel" },
          { text: "Pro を見る", onPress: () => router.push("/pro") },
        ]);
      } else {
        Alert.alert("保存に失敗しました");
      }
    }
  };

  const renderDeadline = () => (
    <>
      <Text style={styles.label}>期限</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker((prev) => !prev)}
      >
        <Text style={styles.inputText}>{dateString(deadline)}</Text>
      </TouchableOpacity>
      {showPicker ? (
        <DateTimePicker
          value={deadline}
          mode="date"
          themeVariant="dark"
          accentColor="#d08000"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, selected) => {
            // 日付を選んだら（iOS の inline 含め）カレンダーを閉じる。
            setShowPicker(false);
            if (selected) setDeadline(selected);
          }}
        />
      ) : null}
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: editing ? "目標を編集" : "新しい目標" }}
      />

      <Text style={styles.label}>目標タイプ</Text>
      <View style={styles.row}>
        {KINDS.map((item) => {
          const active = kind === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.seg,
                active && styles.segActive,
                editing && !active && styles.segLocked,
              ]}
              // タイプは作成後に変更不可（集計/達成管理の整合のため）。
              disabled={Boolean(editing)}
              onPress={() => setKind(item.key)}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.kindDescription}>{KIND_DESCRIPTIONS[kind]}</Text>

      <Text style={styles.label}>種類</Text>
      <View style={styles.chipWrap}>
        {PERIODS.map((period) => {
          const active = periodType === period.key;
          return (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.chip,
                active && styles.chipActive,
                editing && !active && styles.segLocked,
              ]}
              // 編集では種類を変更不可（Pro制限回避防止・集計整合のため）。
              disabled={Boolean(editing)}
              onPress={() => setPeriodType(period.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {periodType === "season" && !canSeason ? (
        <View style={styles.proNote}>
          <Text style={styles.proText}>シーズン目標は Pro プラン限定です</Text>
          <TouchableOpacity onPress={() => router.push("/pro")}>
            <Text style={styles.proLink}>Pro を見る</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {periodType === "tournament" && !canTournament ? (
        <View style={styles.proNote}>
          <Text style={styles.proText}>大会目標は Pro プラン限定です</Text>
          <TouchableOpacity onPress={() => router.push("/pro")}>
            <Text style={styles.proLink}>Pro を見る</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {periodType === "monthly" ? (
        <Text style={styles.hint}>対象期間: 今月（自動設定）</Text>
      ) : null}
      {periodType === "weekly" ? (
        <Text style={styles.hint}>対象期間: 今週 月〜日（自動設定）</Text>
      ) : null}
      {periodType === "yearly" ? (
        <Text style={styles.hint}>対象期間: 今年 1月〜12月（自動設定）</Text>
      ) : null}

      {periodType === "custom" ? (
        <>
          <Text style={styles.label}>開始日</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartPicker((prev) => !prev)}
          >
            <Text style={styles.inputText}>{dateString(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker ? (
            <DateTimePicker
              value={startDate}
              mode="date"
              themeVariant="dark"
              accentColor="#d08000"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_event, selected) => {
                setShowStartPicker(false);
                if (selected) setStartDate(selected);
              }}
            />
          ) : null}
          {renderDeadline()}
        </>
      ) : null}

      {periodType === "season" ? (
        <>
          <Text style={styles.label}>シーズン</Text>
          {seasons.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyLink}
              onPress={() => router.push("/(profile)/seasons")}
            >
              <Ionicons name="add-circle-outline" size={16} color="#d08000" />
              <Text style={styles.emptyLinkText}>
                シーズンがありません。シーズンを登録する
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.chipWrap}>
              {seasons.map((season) => {
                const active = season.id === seasonId;
                return (
                  <TouchableOpacity
                    key={season.id}
                    style={[styles.chip, active && styles.chipActive]}
                    disabled={Boolean(editing)}
                    onPress={() => setSeasonId(season.id)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {season.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {renderDeadline()}
        </>
      ) : null}

      {periodType === "tournament" ? (
        <>
          <Text style={styles.label}>大会</Text>
          {tournaments.length === 0 ? (
            <Text style={styles.emptyText}>
              大会がありません。試合記録で大会を登録してください。
            </Text>
          ) : (
            <View style={styles.chipWrap}>
              {tournaments.map((tournament) => {
                const active = tournament.id === tournamentId;
                return (
                  <TouchableOpacity
                    key={tournament.id}
                    style={[styles.chip, active && styles.chipActive]}
                    disabled={Boolean(editing)}
                    onPress={() => setTournamentId(tournament.id)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {tournament.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {renderDeadline()}
        </>
      ) : null}

      {isQualitative || isManual ? null : (
        <>
          <Text style={styles.label}>指標</Text>
          {GOAL_METRIC_CATEGORIES.map((category) => (
            <View key={category.key} style={styles.metricGroup}>
              <Text style={styles.metricGroupLabel}>{category.label}</Text>
              <View style={styles.chipWrap}>
                {metricsInCategory(category.keys).map((item) => {
                  const active = item.key === metricKey;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.chip,
                        active && styles.chipActive,
                        editing && !active && styles.segLocked,
                      ]}
                      // 指標も編集不可（切り替えると既存の目標値が新指標に対して無意味になるため）。
                      disabled={Boolean(editing)}
                      onPress={() => setMetricKey(item.key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {isMenuMetric ? (
            <>
              <Text style={styles.label}>対象の練習メニュー</Text>
              {menus.length === 0 ? (
                <Text style={styles.emptyText}>
                  練習メニューがありません。練習記録で登録してください。
                </Text>
              ) : (
                <View style={styles.chipWrap}>
                  {menus.map((menu) => {
                    const active = menu.id === practiceMenuId;
                    return (
                      <TouchableOpacity
                        key={menu.id}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setPracticeMenuId(menu.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {menu.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              <Text style={styles.hint}>
                期間内にこのメニューを実施した「日数」を数えます。
              </Text>
            </>
          ) : (
            <Text style={styles.hint}>
              条件: {metric.comparison === "less_than" ? "以下" : "以上"}
            </Text>
          )}
        </>
      )}

      {isManual ? (
        <>
          <Text style={styles.label}>指標名</Text>
          <TextInput
            style={styles.input}
            value={customLabel}
            onChangeText={setCustomLabel}
            placeholder="例: 球速 / 遠投距離 / 体重"
            placeholderTextColor="#71717A"
          />
          <Text style={styles.label}>単位（任意）</Text>
          <TextInput
            style={styles.input}
            value={customUnit}
            onChangeText={setCustomUnit}
            placeholder="例: km/h"
            placeholderTextColor="#71717A"
          />
          <Text style={styles.label}>条件</Text>
          <View style={styles.row}>
            {COMPARISONS.map((item) => {
              const active = comparison === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.seg, active && styles.segActive]}
                  onPress={() => setComparison(item.key)}
                >
                  <Text
                    style={[styles.segText, active && styles.segTextActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>
            現在値は手入力で更新します（自動集計はしません）。
          </Text>
        </>
      ) : null}

      {isQualitative ? null : (
        <>
          <Text style={styles.label}>目標値</Text>
          <TextInput
            style={styles.input}
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
            placeholder={metric.decimal ? "例: 0.300" : "例: 20"}
            placeholderTextColor="#71717A"
          />
          {isManual ? (
            <>
              <Text style={styles.label}>現在値</Text>
              <TextInput
                style={styles.input}
                value={manualCurrent}
                onChangeText={setManualCurrent}
                keyboardType="numeric"
                placeholder="例: 125"
                placeholderTextColor="#71717A"
              />
            </>
          ) : null}
        </>
      )}

      <Text style={styles.label}>
        {isQualitative ? "目標" : "タイトル（任意）"}
      </Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={
          isQualitative
            ? "例: この大会で優勝する"
            : isManual
              ? customLabel.trim() || "指標名の目標"
              : metricExample(metricKey) || `${metric.label}目標`
        }
        placeholderTextColor="#71717A"
      />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>{editing ? "更新" : "保存"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#3A3A3A",
  },
  segActive: { backgroundColor: "#d08000" },
  segLocked: { opacity: 0.4 },
  segText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  segTextActive: { color: "#FFFFFF" },
  proNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  proText: { color: "#A1A1AA", fontSize: 13 },
  proLink: { color: "#d08000", fontSize: 13, fontWeight: "700" },
  hint: { color: "#71717A", fontSize: 12, marginTop: 8 },
  kindDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
  },
  emptyLinkText: { color: "#d08000", fontSize: 13, fontWeight: "600" },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricGroup: { marginTop: 12 },
  metricGroupLabel: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  inputText: { color: "#F4F4F4", fontSize: 15 },
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
