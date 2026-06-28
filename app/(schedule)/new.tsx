import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { WEEK_DAYS } from "@constants/schedule";
import { useEntitlement } from "@hooks/useEntitlement";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { useScheduleMutations } from "@hooks/useSchedules";

const timeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export default function ScheduleNewScreen() {
  const router = useRouter();
  const { createSchedule, isCreating } = useScheduleMutations();
  const { menus } = usePracticeMenus();
  const { hasEntitlement } = useEntitlement();
  const canCustomize = hasEntitlement("custom_notification_messages");

  const [title, setTitle] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState(new Date(2000, 0, 1, 6, 0));
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);
  const [notify, setNotify] = useState(true);
  const [message, setMessage] = useState("");

  const toggleDay = (num: number) =>
    setDays((prev) =>
      prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num],
    );
  const toggleMenu = (id: number) =>
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("タイトルを入力してください");
    if (days.length === 0) return Alert.alert("曜日を選択してください");
    try {
      await createSchedule({
        title: title.trim(),
        days_of_week: [...days].sort((a, b) => a - b).join(","),
        scheduled_time: timeString(time),
        notification_enabled: notify,
        notification_message:
          canCustomize && message.trim() ? message.trim() : null,
        menus: selectedMenus.map((id) => {
          const menu = menus.find((item) => item.id === id);
          return {
            practice_menu_id: id,
            target_value: menu?.default_value ?? null,
          };
        }),
      });
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert(
          "無料プランの上限",
          "スケジュールは無料で3つまでです。Pro で無制限に登録できます。",
          [
            { text: "閉じる", style: "cancel" },
            { text: "Pro を見る", onPress: () => router.push("/pro") },
          ],
        );
      } else {
        Alert.alert("保存に失敗しました");
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 朝の素振り"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>曜日</Text>
      <View style={styles.dayRow}>
        {WEEK_DAYS.map((day) => {
          const active = days.includes(day.num);
          return (
            <TouchableOpacity
              key={day.num}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => toggleDay(day.num)}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>時刻</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker((prev) => !prev)}
      >
        <Text style={styles.timeText}>{timeString(time)}</Text>
      </TouchableOpacity>
      {showPicker ? (
        <DateTimePicker
          value={time}
          mode="time"
          themeVariant="dark"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (selected) setTime(selected);
          }}
        />
      ) : null}

      <Text style={styles.label}>メニュー（任意）</Text>
      <View style={styles.menuWrap}>
        {menus.map((menu) => {
          const active = selectedMenus.includes(menu.id);
          return (
            <TouchableOpacity
              key={menu.id}
              style={[styles.menuChip, active && styles.menuChipActive]}
              onPress={() => toggleMenu(menu.id)}
            >
              <Text style={[styles.menuText, active && styles.menuTextActive]}>
                {menu.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>プッシュ通知</Text>
        <Switch
          value={notify}
          onValueChange={setNotify}
          trackColor={{ true: "#d08000", false: "#52525B" }}
        />
      </View>

      {canCustomize ? (
        <>
          <Text style={styles.label}>カスタム通知文（Pro）</Text>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="おはよう！今日も素振りしよう"
            placeholderTextColor="#71717A"
          />
        </>
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
  timeText: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  dayRow: { flexDirection: "row", gap: 6 },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3A3A",
  },
  dayChipActive: { backgroundColor: "#d08000" },
  dayText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  dayTextActive: { color: "#FFFFFF" },
  menuWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  menuChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  menuChipActive: { backgroundColor: "#d08000" },
  menuText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  menuTextActive: { color: "#FFFFFF" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  switchLabel: { color: "#F4F4F4", fontSize: 14 },
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
