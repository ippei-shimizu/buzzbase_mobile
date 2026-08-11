import type { PracticeMenu } from "../../types/practice";
import type { EventType, ScheduleInput } from "../../types/schedule";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import {
  EVENT_TYPES,
  SCHEDULE_NOTE_MAX_LENGTH,
  WEEK_DAYS,
} from "@constants/schedule";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMenuSets } from "@hooks/useMenuSets";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { useSchedules, useScheduleMutations } from "@hooks/useSchedules";
import { formatAmount } from "@utils/formatAmount";
import { formatJaFullDate } from "@utils/formatDate";
import { fromIsoDate, toIsoDate } from "@utils/planDate";

type Recurrence = "single" | "weekly";
type MenuSource = "set" | "individual";

const timeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const parseTime = (value: string | null): Date => {
  const base = new Date(2000, 0, 1, 6, 0);
  if (!value) return base;
  const [hour, minute] = value.split(":").map(Number);
  // 時刻は URL パラメータ経由でも渡るため、壊れた値では既定時刻に戻す。
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return base;
  base.setHours(hour, minute, 0, 0);
  return base;
};

export default function ScheduleFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    date?: string;
    time?: string;
    singleOnly?: string;
  }>();
  const editingId = params.id ? Number(params.id) : null;
  const prefillDate = params.date ?? null;
  const prefillTime = params.time ?? null;
  // 週プランの「＋」は日付が確定した文脈なので「この日だけ」に固定し、毎週への切替を出さない。
  const singleOnly = params.singleOnly === "1";

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
  const isSavingRef = useRef(false);

  const [recurrence, setRecurrence] = useState<Recurrence>(
    singleOnly || editing?.planned_on || prefillDate ? "single" : "weekly",
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
    parseTime(editing?.scheduled_time ?? prefillTime),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  // 終了時刻は任意。未設定を表せるよう Date ではなく null を持てるようにする。
  const [endTime, setEndTime] = useState<Date | null>(
    editing?.end_time ? parseTime(editing.end_time) : null,
  );
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [note, setNote] = useState(editing?.note ?? "");
  const [menuSource, setMenuSource] = useState<MenuSource>(
    editing?.menu_set_id ? "set" : "individual",
  );
  const [menuSetId, setMenuSetId] = useState<number | null>(
    editing?.menu_set_id ?? null,
  );
  const [menuAmounts, setMenuAmounts] = useState<Record<number, string>>(() => {
    if (editing?.menu_set_id) return {};
    const initial: Record<number, string> = {};
    editing?.menus.forEach((menu) => {
      initial[menu.practice_menu_id] = formatAmount(menu.target_value);
    });
    return initial;
  });
  const [notify, setNotify] = useState(editing?.notification_enabled ?? true);
  const [message, setMessage] = useState(editing?.notification_message ?? "");

  // 練習ログが記録済みのメニューは、済判定が壊れるため編集画面から変更できないようにする。
  const lockedMenuIds = new Set(editing?.logged_practice_menu_ids ?? []);
  const hasLockedMenu = lockedMenuIds.size > 0;

  const toggleDay = (num: number) =>
    setDays((prev) =>
      prev.includes(num) ? prev.filter((day) => day !== num) : [...prev, num],
    );
  const toggleMenu = (menu: PracticeMenu) => {
    if (lockedMenuIds.has(menu.id)) return;
    setMenuAmounts((prev) => {
      if (menu.id in prev) {
        const next = { ...prev };
        delete next[menu.id];
        return next;
      }
      return { ...prev, [menu.id]: formatAmount(menu.default_value) };
    });
  };
  const setMenuAmount = (menuId: number, amount: string) => {
    if (lockedMenuIds.has(menuId)) return;
    setMenuAmounts((prev) => ({ ...prev, [menuId]: amount }));
  };

  const handleSave = async () => {
    // isPending は再レンダー後にしか true にならないため、同一フレームの連打を ref で弾く。
    if (isSavingRef.current) return;
    const usingSet = menuSource === "set" && menuSetId != null;
    if (!usingSet && !title.trim()) {
      return Alert.alert("タイトルを入力してください");
    }
    if (recurrence === "weekly" && days.length === 0) {
      return Alert.alert("曜日を選択してください");
    }
    if (endTime && timeString(endTime) <= timeString(time)) {
      return Alert.alert("終了時刻は開始時刻より後にしてください");
    }
    if (note.length > SCHEDULE_NOTE_MAX_LENGTH) {
      return Alert.alert(
        `メモは${SCHEDULE_NOTE_MAX_LENGTH}文字以内で入力してください`,
      );
    }

    const input: ScheduleInput = {
      title: title.trim() || null,
      event_type: eventType,
      scheduled_time: timeString(time),
      end_time: endTime ? timeString(endTime) : null,
      note: note.trim() || null,
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
        : Object.entries(menuAmounts).map(([id, amount]) => ({
            practice_menu_id: Number(id),
            target_value: amount.trim() ? Number(amount) : null,
          })),
    };

    isSavingRef.current = true;
    try {
      if (editingId) {
        await updateSchedule({ id: editingId, input });
      } else {
        await createSchedule(input);
      }
      router.back();
    } catch {
      isSavingRef.current = false;
      Alert.alert("保存に失敗しました");
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>いつ</Text>
      {singleOnly ? null : (
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
      )}

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
            style={[styles.input, styles.dateInput]}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <Text style={styles.valueText}>
              {formatJaFullDate(toIsoDate(date))}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#A1A1AA" />
          </TouchableOpacity>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              themeVariant="dark"
              accentColor="#d08000"
              locale="ja-JP"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_event, selected) => {
                setShowDatePicker(false);
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
        placeholder={eventType === "game" ? "vs 港南高" : "例: 朝の素振り"}
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>時刻</Text>
      <TouchableOpacity
        style={[styles.input, styles.timeInput]}
        onPress={() => setShowTimePicker((prev) => !prev)}
      >
        <Text style={styles.valueText}>{timeString(time)}</Text>
        <Ionicons name="time-outline" size={18} color="#A1A1AA" />
      </TouchableOpacity>
      {showTimePicker ? (
        <DateTimePicker
          value={time}
          mode="time"
          themeVariant="dark"
          accentColor="#d08000"
          locale="ja-JP"
          minuteInterval={5}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selected) => {
            // iOS はホイール操作のたびに発火するため開いたままにし、再タップで閉じる。
            if (Platform.OS !== "ios") setShowTimePicker(false);
            if (selected) setTime(selected);
          }}
        />
      ) : null}

      <Text style={styles.label}>終了時刻（任意）</Text>
      <TouchableOpacity
        style={[styles.input, styles.timeInput]}
        onPress={() => setShowEndTimePicker((prev) => !prev)}
      >
        <Text style={endTime ? styles.valueText : styles.placeholderText}>
          {endTime ? timeString(endTime) : "未設定"}
        </Text>
        <View style={styles.timeActions}>
          {endTime ? (
            <TouchableOpacity onPress={() => setEndTime(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          ) : null}
          <Ionicons name="time-outline" size={18} color="#A1A1AA" />
        </View>
      </TouchableOpacity>
      {showEndTimePicker ? (
        <DateTimePicker
          value={endTime ?? time}
          mode="time"
          themeVariant="dark"
          accentColor="#d08000"
          locale="ja-JP"
          minuteInterval={5}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowEndTimePicker(false);
            if (selected) setEndTime(selected);
          }}
        />
      ) : null}

      <Text style={styles.label}>メモ（任意）</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={note}
        onChangeText={setNote}
        placeholder="集合場所や持ち物など"
        placeholderTextColor="#71717A"
        multiline
      />

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
        <View style={styles.menuSetList}>
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
                  style={[
                    styles.menuSetCard,
                    active && styles.menuSetCardActive,
                  ]}
                  onPress={() =>
                    setMenuSetId((prev) => (prev === set.id ? null : set.id))
                  }
                >
                  <Text
                    style={[
                      styles.menuSetName,
                      active && styles.menuSetNameActive,
                    ]}
                  >
                    {set.name}
                  </Text>
                  {/* セット名だけでは中身が分からず、意図しないセットを選んでしまう。 */}
                  <Text style={styles.menuSetItems} numberOfLines={2}>
                    {set.items.length > 0
                      ? set.items.map((item) => item.name).join(" / ")
                      : "メニュー未設定"}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      ) : (
        <View>
          {hasLockedMenu ? (
            <Text style={styles.lockedHint}>
              練習記録が済のメニューは変更できません
            </Text>
          ) : null}
          {menus.map((menu) => {
            const isSelected = menu.id in menuAmounts;
            const isLocked = lockedMenuIds.has(menu.id);
            return (
              <View key={menu.id} style={styles.menuItem}>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => toggleMenu(menu)}
                  disabled={isLocked}
                >
                  <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={22}
                    color={
                      isLocked ? "#52525B" : isSelected ? "#d08000" : "#71717A"
                    }
                  />
                  <Text
                    style={[
                      styles.menuItemName,
                      isLocked && styles.menuItemNameLocked,
                    ]}
                  >
                    {menu.name}
                  </Text>
                  {isLocked ? (
                    <Ionicons name="lock-closed" size={14} color="#71717A" />
                  ) : null}
                </TouchableOpacity>
                {isSelected ? (
                  <View style={styles.amountRow}>
                    <TextInput
                      style={styles.amountInput}
                      value={menuAmounts[menu.id]}
                      onChangeText={(text) => setMenuAmount(menu.id, text)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#71717A"
                      editable={!isLocked}
                    />
                    <Text style={styles.unitLabel}>
                      {menu.unit_label ?? "回"}
                    </Text>
                  </View>
                ) : null}
              </View>
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
          {editingId ? "更新" : "登録する"}
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
  menuSetList: { gap: 8, marginTop: 12, marginBottom: 8 },
  menuSetCard: {
    borderWidth: 1,
    borderColor: "#4A4A4A",
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuSetCardActive: { borderColor: "#d08000" },
  menuSetName: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  menuSetNameActive: { color: "#d08000" },
  menuSetItems: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
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
    borderWidth: 1,
    borderColor: "#52525B",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  valueText: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  placeholderText: { color: "#71717A", fontSize: 16 },
  timeActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  noteInput: { minHeight: 88, textAlignVertical: "top", paddingTop: 12 },
  dateInput: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  menuItem: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  menuItemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuItemName: { color: "#F4F4F4", fontSize: 15, fontWeight: "600", flex: 1 },
  menuItemNameLocked: { color: "#A1A1AA" },
  lockedHint: { color: "#71717A", fontSize: 12, marginBottom: 8 },
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
