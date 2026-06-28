import type {
  ConditionInput,
  PracticeMenu,
  PracticeSession,
  PracticeSessionItemInput,
} from "../../types/practice";
import type { ConditionDraft } from "@components/practice/ConditionForm";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ConditionForm,
  EMPTY_CONDITION_DRAFT,
} from "@components/practice/ConditionForm";
import { ProGate } from "@components/pro/ProGate";
import { PRACTICE_CATEGORIES } from "@constants/practice";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import {
  usePracticeSessionByDate,
  usePracticeSessionMutations,
} from "@hooks/usePracticeSessions";
import { formatAmount } from "@utils/formatAmount";

const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

// "YYYY-MM-DD" をローカル日付の Date に変換する（new Date(string) の UTC ずれを避ける）。
const parseDateString = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toConditionDraft = (session: PracticeSession | null): ConditionDraft => {
  const condition = session?.condition;
  if (!condition) return EMPTY_CONDITION_DRAFT;
  return {
    fatigue_level: condition.fatigue_level,
    physical_level: condition.physical_level,
    sleep_hours:
      condition.sleep_hours != null ? String(condition.sleep_hours) : "",
    mood: condition.mood,
    memo: condition.memo ?? "",
    injuries: condition.injuries ?? [],
  };
};

const draftHasContent = (draft: ConditionDraft): boolean =>
  draft.fatigue_level != null ||
  draft.physical_level != null ||
  draft.sleep_hours.trim() !== "" ||
  draft.mood != null ||
  draft.memo.trim() !== "" ||
  draft.injuries.length > 0;

const toConditionInput = (draft: ConditionDraft): ConditionInput => ({
  fatigue_level: draft.fatigue_level,
  physical_level: draft.physical_level,
  sleep_hours: draft.sleep_hours.trim() ? Number(draft.sleep_hours) : null,
  mood: draft.mood,
  memo: draft.memo.trim() || null,
  injuries: draft.injuries,
});

/** 選択済みメニュー（量の編集途中文字列を保持）。 */
type SelectedItems = Record<number, string>;

const toSelectedItems = (session: PracticeSession | null): SelectedItems => {
  const selected: SelectedItems = {};
  session?.practice_logs
    .filter((log) => log.source === "manual" && log.practice_menu_id != null)
    .forEach((log) => {
      selected[log.practice_menu_id as number] = formatAmount(log.amount);
    });
  return selected;
};

function DailyEditor({
  dateString,
  initialSession,
  menus,
}: {
  dateString: string;
  initialSession: PracticeSession | null;
  menus: PracticeMenu[];
}) {
  const router = useRouter();
  const { saveSession, isSaving } = usePracticeSessionMutations();

  const [selected, setSelected] = useState<SelectedItems>(() =>
    toSelectedItems(initialSession),
  );
  const [condition, setCondition] = useState<ConditionDraft>(() =>
    toConditionDraft(initialSession),
  );

  const favorites = menus.filter((menu) => menu.is_favorite);

  const toggleMenu = (menu: PracticeMenu) =>
    setSelected((prev) => {
      if (menu.id in prev) {
        const next = { ...prev };
        delete next[menu.id];
        return next;
      }
      return {
        ...prev,
        [menu.id]: formatAmount(menu.default_value),
      };
    });

  const setAmount = (menuId: number, amount: string) =>
    setSelected((prev) => ({ ...prev, [menuId]: amount }));

  const items: PracticeSessionItemInput[] = Object.entries(selected).map(
    ([menuId, amount]) => ({
      practice_menu_id: Number(menuId),
      amount: amount.trim() ? Number(amount) : null,
    }),
  );

  // 保存後に野球ノートへ進むか、練習記録のみで終えるかを呼び出し側のボタンで分ける。
  const handleSave = async (withNote: boolean) => {
    const hasCondition = draftHasContent(condition);
    if (items.length === 0 && !hasCondition) {
      Alert.alert("記録する内容がありません", "メニューを選んでください");
      return;
    }
    try {
      const session = await saveSession({
        logged_on: dateString,
        items,
        condition: hasCondition ? toConditionInput(condition) : null,
      });
      if (withNote) {
        router.replace({
          pathname: "/(note)/new",
          params: { date: dateString, practiceSessionId: String(session.id) },
        });
      } else {
        router.back();
      }
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  const renderMenu = (menu: PracticeMenu) => {
    const isSelected = menu.id in selected;
    return (
      <View key={menu.id} style={styles.menuItem}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => toggleMenu(menu)}
        >
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={22}
            color={isSelected ? "#d08000" : "#71717A"}
          />
          <Text style={styles.menuName}>{menu.name}</Text>
        </TouchableOpacity>
        {isSelected ? (
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={selected[menu.id]}
              onChangeText={(text) => setAmount(menu.id, text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#71717A"
            />
            <Text style={styles.unitLabel}>{menu.unit_label ?? ""}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>練習メニュー（複数選択可）</Text>
      {favorites.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>★ お気に入り</Text>
          {favorites.map(renderMenu)}
        </View>
      ) : null}
      {PRACTICE_CATEGORIES.map((category) => {
        const inCategory = menus.filter(
          (menu) => menu.category === category.key,
        );
        if (inCategory.length === 0) return null;
        return (
          <View key={category.key} style={styles.group}>
            <Text style={styles.groupTitle}>{category.label}</Text>
            {inCategory.map(renderMenu)}
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.addRow}
        onPress={() => router.push("/(practice-record)/menu-new")}
      >
        <Ionicons name="add" size={18} color="#d08000" />
        <Text style={styles.addRowText}>新しいメニューを追加</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>コンディション</Text>
      <ProGate
        feature="detailed_condition_log"
        renderLockedTrigger={(open) => (
          <TouchableOpacity style={styles.conditionLocked} onPress={open}>
            <Ionicons name="lock-closed" size={16} color="#A1A1AA" />
            <Text style={styles.conditionLockedText}>
              疲労・体調・睡眠・気分・怪我の記録は Pro 限定
            </Text>
          </TouchableOpacity>
        )}
      >
        <ConditionForm value={condition} onChange={setCondition} />
      </ProGate>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={() => handleSave(true)}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>野球ノートを書く</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveSubButton, isSaving && styles.saveButtonDisabled]}
        onPress={() => handleSave(false)}
        disabled={isSaving}
      >
        <Text style={styles.saveSubButtonText}>練習記録のみ保存</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DailyRecordScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const [date, setDate] = useState(() =>
    params.date ? parseDateString(params.date) : new Date(),
  );
  const [showPicker, setShowPicker] = useState(false);
  const dateString = useMemo(() => toDateString(date), [date]);

  const { menus, isLoading: isMenusLoading } = usePracticeMenus();
  const { session, isLoading: isSessionLoading } =
    usePracticeSessionByDate(dateString);

  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>日付</Text>
      <TouchableOpacity
        style={styles.dateRow}
        onPress={() => setShowPicker((prev) => !prev)}
      >
        <Text style={styles.dateText}>{dateString}</Text>
        <Ionicons name="calendar-outline" size={18} color="#A1A1AA" />
      </TouchableOpacity>
      {showPicker ? (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          themeVariant="dark"
          accentColor="#d08000"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      ) : null}

      {isMenusLoading || isSessionLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : menus.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>まだ練習メニューがありません</Text>
          <Text style={styles.emptyText}>
            よくやる練習を登録すると、ワンタップで選べます
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(practice-record)/menu-new")}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>最初のメニューを作る</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DailyEditor
          key={dateString}
          dateString={dateString}
          initialSession={session}
          menus={menus}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 48 },
  centered: { paddingVertical: 48, alignItems: "center" },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
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
  group: { marginBottom: 12 },
  groupTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuName: { color: "#F4F4F4", fontSize: 15, fontWeight: "600", flex: 1 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginLeft: 32,
  },
  amountInput: {
    width: 120,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  unitLabel: { color: "#A1A1AA", fontSize: 15 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  addRowText: { color: "#d08000", fontSize: 15, fontWeight: "600" },
  conditionLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  conditionLockedText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  saveSubButton: {
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveSubButtonText: { color: "#F4F4F4", fontSize: 15, fontWeight: "600" },
});
