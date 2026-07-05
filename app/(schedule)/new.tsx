import type { EventType, ScheduleInput } from "../../types/schedule";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { EVENT_TYPES, WEEK_DAYS } from "@constants/schedule";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMenuSets } from "@hooks/useMenuSets";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { useSchedules, useScheduleMutations } from "@hooks/useSchedules";
import { fromIsoDate, toIsoDate } from "@utils/planDate";

type Recurrence = "single" | "weekly";
type MenuSource = "set" | "individual";

const timeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const parseTime = (value: string | null): Date => {
  const base = new Date(2000, 0, 1, 6, 0);
  if (!value) return base;
  const [hour, minute] = value.split(":").map(Number);
  base.setHours(hour, minute, 0, 0);
  return base;
};

export default function ScheduleFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const editingId = params.id ? Number(params.id) : null;
  const prefillDate = params.date ?? null;

  const { schedules } = useSchedules();
  const editing = editingId
    ? schedules.find((schedule) => schedule.id === editingId)
    : undefined;

  const { createSchedule, updateSchedule, isCreating, isUpdating } =
    useScheduleMutations();
  const { menus } = usePracticeMenus();
  const { menuSets } = useMenuSets();
  const { hasEntitlement } = useEntitlement();
  const canCustomize = hasEntitlement("custom_notification_messages");

  const [recurrence, setRecurrence] = useState<Recurrence>(
    editing?.planned_on || prefillDate ? "single" : "weekly",
  );
  const [eventType, setEventType] = useState<EventType>(
    editing?.event_type ?? "self_practice",
  );
  const [title, setTitle] = useState(editing?.title ?? "");
  const [days, setDays] = useState<number[]>(
    editing?.days_of_week ? editing.days_of_week.split(",").map(Number) : [],
  );
  const [date, setDate] = useState<Date>(
    editing?.planned_on
      ? fromIsoDate(editing.planned_on)
      : prefillDate
        ? fromIsoDate(prefillDate)
        : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState<Date>(
    parseTime(editing?.scheduled_time ?? null),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [menuSource, setMenuSource] = useState<MenuSource>(
    editing?.menu_set_id ? "set" : "individual",
  );
  const [menuSetId, setMenuSetId] = useState<number | null>(
    editing?.menu_set_id ?? null,
  );
  const [selectedMenus, setSelectedMenus] = useState<number[]>(
    editing?.menu_set_id
      ? []
      : (editing?.menus.map((menu) => menu.practice_menu_id) ?? []),
  );
  const [notify, setNotify] = useState(editing?.notification_enabled ?? true);
  const [message, setMessage] = useState(editing?.notification_message ?? "");

  const toggleDay = (num: number) =>
    setDays((prev) =>
      prev.includes(num) ? prev.filter((day) => day !== num) : [...prev, num],
    );
  const toggleMenu = (id: number) =>
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((menu) => menu !== id) : [...prev, id],
    );

  const handleSave = async () => {
    const usingSet = menuSource === "set" && menuSetId != null;
    if (!usingSet && !title.trim()) {
      return Alert.alert("タイトルを入力してください");
    }
    if (recurrence === "weekly" && days.length === 0) {
      return Alert.alert("曜日を選択してください");
    }

    const input: ScheduleInput = {
      title: title.trim() || null,
      event_type: eventType,
      scheduled_time: timeString(time),
      notification_enabled: notify,
      notification_message:
        canCustomize && message.trim() ? message.trim() : null,
      days_of_week:
        recurrence === "weekly"
          ? [...days].sort((a, b) => a - b).join(",")
          : null,
      planned_on: recurrence === "single" ? toIsoDate(date) : null,
      menu_set_id: usingSet ? menuSetId : null,
      menus: usingSet
        ? undefined
        : selectedMenus.map((id) => {
            const menu = menus.find((item) => item.id === id);
            return {
              practice_menu_id: id,
              target_value: menu?.default_value ?? null,
            };
          }),
    };

    try {
      if (editingId) {
        await updateSchedule({ id: editingId, input });
      } else {
        await createSchedule(input);
      }
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert(
          "無料プランの上限",
          "プランの割り当ては無料で3つまでです。Pro で無制限に登録できます。",
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

  const saving = isCreating || isUpdating;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>いつ</Text>
      <View style={styles.segment}>
        <SegmentButton
          active={recurrence === "single"}
          label="この日だけ"
          onPress={() => setRecurrence("single")}
        />
        <SegmentButton
          active={recurrence === "weekly"}
          label="毎週"
          onPress={() => setRecurrence("weekly")}
        />
      </View>

      {recurrence === "weekly" ? (
        <View style={styles.dayRow}>
          {WEEK_DAYS.map((day) => {
            const active = days.includes(day.num);
            return (
              <TouchableOpacity
                key={day.num}
                style={[styles.dayChip, active && styles.chipActive]}
                onPress={() => toggleDay(day.num)}
              >
                <Text style={[styles.dayText, active && styles.textActive]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <Text style={styles.valueText}>{toIsoDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              themeVariant="dark"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selected) => {
                if (Platform.OS !== "ios") setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          ) : null}
        </>
      )}

      <Text style={styles.label}>種別</Text>
      <View style={styles.eventRow}>
        {EVENT_TYPES.map((event) => {
          const active = eventType === event.value;
          return (
            <TouchableOpacity
              key={event.value}
              style={[
                styles.eventChip,
                active && { backgroundColor: event.color },
              ]}
              onPress={() => setEventType(event.value)}
            >
              <Text style={[styles.eventText, active && styles.textActive]}>
                {event.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>
        タイトル{menuSource === "set" ? "（任意）" : ""}
      </Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={
          eventType === "game" ? "例: 試合 vs 港南中" : "例: 朝の素振り"
        }
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>時刻</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimePicker((prev) => !prev)}
      >
        <Text style={styles.valueText}>{timeString(time)}</Text>
      </TouchableOpacity>
      {showTimePicker ? (
        <DateTimePicker
          value={time}
          mode="time"
          themeVariant="dark"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowTimePicker(false);
            if (selected) setTime(selected);
          }}
        />
      ) : null}

      <Text style={styles.label}>メニュー（任意）</Text>
      <View style={styles.segment}>
        <SegmentButton
          active={menuSource === "individual"}
          label="個別に選ぶ"
          onPress={() => setMenuSource("individual")}
        />
        <SegmentButton
          active={menuSource === "set"}
          label="セットから"
          onPress={() => setMenuSource("set")}
        />
      </View>

      {menuSource === "set" ? (
        <View style={styles.menuWrap}>
          {menuSets.length === 0 ? (
            <Text style={styles.hint}>
              メニューセットがありません。プラン管理から作成できます。
            </Text>
          ) : (
            menuSets.map((set) => {
              const active = menuSetId === set.id;
              return (
                <TouchableOpacity
                  key={set.id}
                  style={[styles.menuChip, active && styles.chipActive]}
                  onPress={() =>
                    setMenuSetId((prev) => (prev === set.id ? null : set.id))
                  }
                >
                  <Text style={[styles.menuText, active && styles.textActive]}>
                    {set.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      ) : (
        <View style={styles.menuWrap}>
          {menus.map((menu) => {
            const active = selectedMenus.includes(menu.id);
            return (
              <TouchableOpacity
                key={menu.id}
                style={[styles.menuChip, active && styles.chipActive]}
                onPress={() => toggleMenu(menu.id)}
              >
                <Text style={[styles.menuText, active && styles.textActive]}>
                  {menu.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {editingId ? "更新" : "割り当てる"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SegmentButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.textActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 48 },
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
  valueText: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  segment: {
    flexDirection: "row",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 3,
    gap: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentButtonActive: { backgroundColor: "#d08000" },
  segmentText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  dayRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3A3A",
  },
  dayText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  eventRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  eventChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  eventText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  chipActive: { backgroundColor: "#d08000" },
  textActive: { color: "#FFFFFF" },
  menuWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  menuChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  menuText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  hint: { color: "#71717A", fontSize: 13 },
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
