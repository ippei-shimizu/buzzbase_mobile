import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { dayLabels } from "@constants/schedule";
import { useScheduleMutations, useSchedules } from "@hooks/useSchedules";
import { syncScheduleReminders } from "@services/scheduleReminderService";

const isExpoGo = Constants.appOwnership === "expo";

export default function ScheduleListScreen() {
  const router = useRouter();
  const { schedules, isLoading } = useSchedules();
  const { deleteSchedule } = useScheduleMutations();

  // スケジュールが変わるたびに端末のローカル通知を貼り直す。
  useEffect(() => {
    if (isExpoGo) return;
    void syncScheduleReminders(schedules);
  }, [schedules]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert("削除しますか？", title, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => deleteSchedule(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {schedules.length === 0 ? (
        <Text style={styles.empty}>
          スケジュールを登録すると、設定した曜日・時刻に通知が届きます
        </Text>
      ) : (
        schedules.map((schedule) => (
          <View key={schedule.id} style={styles.card}>
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{schedule.title}</Text>
              <Text style={styles.cardMeta}>
                {dayLabels(schedule.days_of_week)} ・ {schedule.scheduled_time}
              </Text>
              {schedule.menus.length > 0 ? (
                <Text style={styles.cardMenus}>
                  {schedule.menus.map((menu) => menu.name).join("・")}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(schedule.id, schedule.title)}
            >
              <Ionicons name="trash-outline" size={20} color="#71717A" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(schedule)/new")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>新しいスケジュール</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  cardMain: { flex: 1 },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  cardMeta: { color: "#A1A1AA", fontSize: 13, marginTop: 4 },
  cardMenus: { color: "#71717A", fontSize: 12, marginTop: 4 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
