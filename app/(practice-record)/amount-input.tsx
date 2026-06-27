import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { usePracticeLogMutations } from "@hooks/usePracticeLogs";
import { usePracticeMenus } from "@hooks/usePracticeMenus";

const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export default function AmountInputScreen() {
  const router = useRouter();
  const { menuId } = useLocalSearchParams<{ menuId: string }>();
  const { menus } = usePracticeMenus();
  const { createLog, isCreating } = usePracticeLogMutations();

  const menu = useMemo(
    () => menus.find((item) => String(item.id) === String(menuId)),
    [menus, menuId],
  );

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [amount, setAmount] = useState(
    menu?.default_value != null ? String(menu.default_value) : "",
  );
  const [memo, setMemo] = useState("");

  if (!menu) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>メニューが見つかりません</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      const log = await createLog({
        practice_menu_id: menu.id,
        logged_on: toDateString(date),
        amount: amount ? Number(amount) : null,
        memo: memo.trim() || null,
      });
      // モデルA: 記録直後に「ノートに残す？」を誘導し、その練習に緩く紐付ける。
      Alert.alert("記録しました", "今日の感覚をノートに残しますか？", [
        { text: "あとで", style: "cancel", onPress: () => router.back() },
        {
          text: "ノートに残す",
          onPress: () =>
            router.replace({
              pathname: "/(note)/new",
              params: {
                practiceLogId: String(log.id),
                date: toDateString(date),
                linkLabel: `${toDateString(date)} の ${menu.name}`,
              },
            }),
        },
      ]);
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.menuName}>{menu.name}</Text>

      <Text style={styles.label}>日付</Text>
      <TouchableOpacity
        style={styles.dateRow}
        onPress={() => setShowPicker((prev) => !prev)}
      >
        <Text style={styles.dateText}>{toDateString(date)}</Text>
        <Ionicons name="calendar-outline" size={18} color="#A1A1AA" />
      </TouchableOpacity>
      {showPicker ? (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          themeVariant="dark"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      ) : null}

      <Text style={styles.label}>量</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#71717A"
        />
        <Text style={styles.unitLabel}>{menu.unit_label ?? ""}</Text>
      </View>

      <Text style={styles.label}>メモ（任意）</Text>
      <TextInput
        style={[styles.input, styles.memoInput]}
        value={memo}
        onChangeText={setMemo}
        multiline
        placeholder="外角を重点的に…"
        placeholderTextColor="#71717A"
      />

      <TouchableOpacity
        style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isCreating}
      >
        <Text style={styles.saveButtonText}>記録する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  menuName: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
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
  amountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  unitLabel: { color: "#A1A1AA", fontSize: 15 },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  memoInput: { minHeight: 72, textAlignVertical: "top" },
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
