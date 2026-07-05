import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSchedules } from "@hooks/useSchedules";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

const todayDayNumber = (): number => {
  const day = new Date().getDay(); // 0=日
  return day === 0 ? 7 : day;
};

/** 今日のやること（当日の自主練スケジュール）。 */
export function TodayTasksSection() {
  const router = useRouter();
  const { schedules } = useSchedules();
  const today = todayDayNumber();
  const todays = schedules.filter((schedule) =>
    schedule.days_of_week.split(",").map(Number).includes(today),
  );

  return (
    <SectionCard title="今日のやること">
      {todays.length === 0 ? (
        <SectionPlaceholder message="今日のスケジュールはありません" />
      ) : (
        todays.map((schedule) => (
          <View key={schedule.id} style={styles.row}>
            <Text style={styles.time}>{schedule.scheduled_time}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {schedule.title}
            </Text>
          </View>
        ))
      )}
      <TouchableOpacity
        style={styles.editRow}
        onPress={() => router.push("/(schedule)/list")}
      >
        <Ionicons name="calendar-outline" size={14} color="#d08000" />
        <Text style={styles.editText}>スケジュールを編集</Text>
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  time: { color: "#A1A1AA", fontSize: 13, width: 48 },
  title: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "rgba(208,128,0,0.08)",
  },
  editText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
});
