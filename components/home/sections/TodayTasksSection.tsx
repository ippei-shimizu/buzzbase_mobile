import type { Plan, PlanMenu } from "../../../types/plan";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { eventTypeMeta } from "@constants/schedule";
import { useDayPlan } from "@hooks/usePlans";
import { todayIso } from "@utils/planDate";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 今日のやること（当日の予定＝繰り返し ∪ 単発を集約表示）。 */
export function TodayTasksSection() {
  const router = useRouter();
  const { plans, isLoading } = useDayPlan(todayIso());

  return (
    <SectionCard title="今日のやること">
      {isLoading ? (
        <ActivityIndicator color="#d08000" style={styles.loading} />
      ) : plans.length === 0 ? (
        <SectionPlaceholder message="今日の予定はありません" />
      ) : (
        plans.map((plan) => (
          <PlanBlock key={plan.id} plan={plan} router={router} />
        ))
      )}

      <TouchableOpacity
        style={styles.addRow}
        onPress={() => router.push("/(schedule)/new")}
      >
        <Ionicons name="add" size={16} color="#d08000" />
        <Text style={styles.addText}>今日やることを足す</Text>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/(schedule)/calendar")}
        >
          <Ionicons name="calendar-outline" size={14} color="#A1A1AA" />
          <Text style={styles.footerText}>カレンダー</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/(schedule)/list")}
        >
          <Ionicons name="list-outline" size={14} color="#A1A1AA" />
          <Text style={styles.footerText}>プランを管理</Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

type RouterType = ReturnType<typeof useRouter>;

function PlanBlock({ plan, router }: { plan: Plan; router: RouterType }) {
  const meta = eventTypeMeta(plan.event_type);
  const isGame = plan.event_type === "game";

  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        {plan.event_type !== "self_practice" ? (
          <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.badgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        ) : null}
        {plan.scheduled_time ? (
          <Text style={styles.time}>{plan.scheduled_time}</Text>
        ) : null}
        <Text style={styles.blockTitle} numberOfLines={1}>
          {plan.title ?? "予定"}
        </Text>
        {plan.done ? (
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
        ) : null}
      </View>

      {isGame ? (
        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/(game-record)/step1-game-info")}
        >
          <Text style={styles.gameButtonText}>結果を記録する →</Text>
        </TouchableOpacity>
      ) : null}

      {plan.menus.map((menu) => (
        <MenuRow key={menu.practice_menu_id} menu={menu} router={router} />
      ))}

      {plan.menu_set_id ? (
        <Text style={styles.setHint}>「{plan.title}」より</Text>
      ) : null}
    </View>
  );
}

function MenuRow({ menu, router }: { menu: PlanMenu; router: RouterType }) {
  const amount =
    menu.target_value != null
      ? `${menu.target_value}${menu.unit_label ?? ""}`
      : "";
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={() => router.push("/(practice-record)/daily")}
    >
      <Ionicons
        name={menu.done ? "checkbox" : "square-outline"}
        size={18}
        color={menu.done ? "#22C55E" : "#71717A"}
      />
      <Text
        style={[styles.menuName, menu.done && styles.menuNameDone]}
        numberOfLines={1}
      >
        {menu.name ?? "メニュー"}
        {amount ? `  ${amount}` : ""}
      </Text>
      {menu.done ? (
        <Text style={styles.doneLabel}>済</Text>
      ) : (
        <Text style={styles.recordLabel}>記録</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loading: { marginVertical: 12 },
  block: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#4A4A4A",
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  time: { color: "#A1A1AA", fontSize: 13 },
  blockTitle: { color: "#F4F4F4", fontSize: 14, fontWeight: "600", flex: 1 },
  gameButton: {
    alignSelf: "flex-start",
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  gameButtonText: { color: "#EF4444", fontSize: 13, fontWeight: "700" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  menuName: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  menuNameDone: { color: "#A1A1AA" },
  doneLabel: { color: "#22C55E", fontSize: 12, fontWeight: "700" },
  recordLabel: { color: "#d08000", fontSize: 12, fontWeight: "700" },
  setHint: { color: "#71717A", fontSize: 11, marginTop: 2 },
  addRow: {
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
  addText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  footerLink: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
});
