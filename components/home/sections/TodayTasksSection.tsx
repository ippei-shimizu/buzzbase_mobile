import type { Plan, PlanMenu } from "../../../types/plan";
import type { PresetMenu } from "../../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PlanMenuRow } from "@components/schedule/PlanMenuRow";
import { eventTypeMeta } from "@constants/schedule";
import {
  dayPlanMenuKey,
  useDayPlan,
  useToggleDayPlanMenu,
} from "@hooks/usePlans";
import { todayIso } from "@utils/planDate";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 今日のやること（当日の予定＝繰り返し ∪ 単発を集約表示）。 */
export function TodayTasksSection() {
  const router = useRouter();
  const today = todayIso();
  const { plans, isLoading } = useDayPlan(today);
  const { toggleMenu, togglingMenuKey } = useToggleDayPlanMenu(today);

  // 今日の全予定メニューを practice_menu_id で dedupe（先勝ち）し、記録画面のプリセットに使う。
  const presetMenus = useMemo<PresetMenu[]>(() => {
    const byId = new Map<number, PresetMenu>();
    plans.forEach((plan) =>
      plan.menus.forEach((menu) => {
        if (!byId.has(menu.practice_menu_id)) {
          byId.set(menu.practice_menu_id, {
            practice_menu_id: menu.practice_menu_id,
            target_value: menu.target_value,
          });
        }
      }),
    );
    return [...byId.values()];
  }, [plans]);

  return (
    <SectionCard title="今日のやること">
      {isLoading ? (
        <ActivityIndicator color="#d08000" style={styles.loading} />
      ) : plans.length === 0 ? (
        <SectionPlaceholder message="今日の予定はありません" />
      ) : (
        plans.map((plan) => (
          <PlanBlock
            key={plan.id}
            plan={plan}
            router={router}
            onToggleMenu={(menu) =>
              toggleMenu({
                scheduleId: plan.id,
                practiceMenuId: menu.practice_menu_id,
                done: menu.done,
              })
            }
            togglingMenuKey={togglingMenuKey}
          />
        ))
      )}

      {presetMenus.length > 0 ? (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() =>
            router.push({
              pathname: "/(practice-record)/daily",
              params: {
                date: todayIso(),
                presetMenus: JSON.stringify(presetMenus),
              },
            })
          }
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <Text style={styles.recordButtonText}>今日の練習を記録する</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.addRow}
        onPress={() => router.push(`/(schedule)/new?date=${today}`)}
      >
        <Ionicons name="add" size={16} color="#d08000" />
        <Text style={styles.addText}>今日やることを登録</Text>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/(schedule)/calendar")}
        >
          <Ionicons name="calendar-outline" size={18} color="#d08000" />
          <Text style={styles.footerText}>カレンダー</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/(menu-set)/list")}
        >
          <Ionicons name="list-outline" size={18} color="#d08000" />
          <Text style={styles.footerText}>プランを管理</Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

type RouterType = ReturnType<typeof useRouter>;

function PlanBlock({
  plan,
  router,
  onToggleMenu,
  togglingMenuKey,
}: {
  plan: Plan;
  router: RouterType;
  onToggleMenu: (menu: PlanMenu) => void;
  togglingMenuKey: string | null;
}) {
  const meta = eventTypeMeta(plan.event_type);
  const isGame = plan.event_type === "game";

  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.badgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>
        <View style={styles.titleRow}>
          {plan.scheduled_time ? (
            <Text style={styles.time}>{plan.scheduled_time}</Text>
          ) : null}
          <Text style={styles.blockTitle} numberOfLines={1}>
            {plan.title ?? "予定"}
          </Text>
          {plan.done ? (
            <Ionicons name="checkmark-circle" size={16} color="#4a8e32" />
          ) : null}
        </View>
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
        <PlanMenuRow
          key={menu.practice_menu_id}
          menu={menu}
          onToggle={onToggleMenu}
          isToggling={
            togglingMenuKey === dayPlanMenuKey(plan.id, menu.practice_menu_id)
          }
        />
      ))}

      {plan.menu_set_id ? (
        <Text style={styles.setHint}>「{plan.title}」より</Text>
      ) : null}
    </View>
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
    gap: 4,
    paddingBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  setHint: { color: "#71717A", fontSize: 11, marginTop: 2 },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "#d08000",
  },
  recordButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "rgba(208,128,0,0.08)",
  },
  addText: { color: "#d08000", fontSize: 14, fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  footerLink: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#3A3A3A",
  },
  footerText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
});
