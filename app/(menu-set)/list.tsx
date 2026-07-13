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
} from "react-native";
import { useMenuSets } from "@hooks/useMenuSets";
import { useSchedules } from "@hooks/useSchedules";
import { syncScheduleReminders } from "@services/scheduleReminderService";

const isExpoGo = Constants.appOwnership === "expo";

export default function MenuSetListScreen() {
  const router = useRouter();
  const { menuSets, isLoading } = useMenuSets();
  const { schedules } = useSchedules();

  // 練習プランの入口画面のため、スケジュールが変わるたびに端末のローカル通知を貼り直す。
  useEffect(() => {
    if (isExpoGo) return;
    void syncScheduleReminders(schedules);
  }, [schedules]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.quickRow}>
        <QuickLink
          icon="grid-outline"
          label="週プラン"
          onPress={() => router.push("/(schedule)/weekly")}
        />
        <QuickLink
          icon="calendar-outline"
          label="カレンダー"
          onPress={() => router.push("/(schedule)/calendar")}
        />
      </View>

      {menuSets.length === 0 ? (
        <Text style={styles.empty}>
          よく組む練習をセットにしておくと、予定登録や週プランでそのまま使えます
        </Text>
      ) : (
        menuSets.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={styles.card}
            onPress={() => router.push(`/(menu-set)/${set.id}`)}
          >
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{set.name}</Text>
              {set.items.length > 0 ? (
                <Text style={styles.cardItems} numberOfLines={2}>
                  {set.items.map((item) => item.name).join(" / ")}
                </Text>
              ) : (
                <Text style={styles.cardEmpty}>メニュー未設定</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(menu-set)/edit")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>新しいセットを作る</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#d08000" />
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quickLink: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3A3A3A",
  },
  quickText: { color: "#F4F4F4", fontSize: 12, fontWeight: "600" },
  empty: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  cardMain: { flex: 1 },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  cardItems: { color: "#A1A1AA", fontSize: 13, marginTop: 4 },
  cardEmpty: { color: "#71717A", fontSize: 12, marginTop: 4 },
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
