import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GoalProgressBar } from "@components/goal/GoalProgressBar";
import { Icon } from "@components/icon/Icon";
import { GOAL_PERIOD_LABELS } from "@constants/goal";
import { useGoalHistory, useGoalMutations, useGoals } from "@hooks/useGoals";

// "YYYY-MM-DD" を Stat ボックスに収まる "YYYY/M/D" へ整形する。
const formatDeadline = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  return `${year}/${month}/${day}`;
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = Number(id);
  const { goals: activeGoals, isLoading } = useGoals();
  const { goals: historyGoals, isLoading: isHistoryLoading } = useGoalHistory();
  const { deleteGoal, achieveGoal, unachieveGoal } = useGoalMutations();
  const goal =
    [...activeGoals, ...historyGoals].find((item) => item.id === goalId) ??
    null;

  if (isLoading || isHistoryLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>目標が見つかりません</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("削除しますか？", goal.title, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deleteGoal(goalId);
          router.back();
        },
      },
    ]);
  };

  const handleToggleAchieve = async () => {
    try {
      await (goal.is_achieved ? unachieveGoal(goalId) : achieveGoal(goalId));
    } catch {
      Alert.alert("更新に失敗しました");
    }
  };

  const canToggleAchieve = goal.kind === "qualitative" && !goal.is_finalized;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              {goal.is_finalized ? null : (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(goal)/new",
                      params: { id: String(goalId) },
                    })
                  }
                >
                  <Icon name="create-outline" size={22} color="#F4F4F4" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDelete}>
                <Icon name="trash-outline" size={22} color="#F31260" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Text style={styles.periodLabel}>
        {GOAL_PERIOD_LABELS[goal.period_type]}
      </Text>

      <View style={styles.card}>
        <GoalProgressBar goal={goal} />
      </View>

      <View style={styles.statsRow}>
        <Stat label="進捗" value={`${Math.round(goal.progress_percent)}%`} />
        <Stat
          label="残り"
          value={goal.is_finalized ? "確定済み" : `${goal.days_remaining}日`}
        />
        <Stat label="期限" value={formatDeadline(goal.deadline)} />
      </View>

      {canToggleAchieve ? (
        <TouchableOpacity
          style={
            goal.is_achieved ? styles.secondaryButton : styles.achieveButton
          }
          onPress={handleToggleAchieve}
        >
          <Text
            style={
              goal.is_achieved
                ? styles.secondaryButtonText
                : styles.achieveButtonText
            }
          >
            {goal.is_achieved ? "達成を取り消す" : "達成にする"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  periodLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  stat: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statValue: { color: "#d08000", fontSize: 16, fontWeight: "700" },
  statLabel: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
  achieveButton: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#d08000",
  },
  achieveButtonText: { color: "#d08000", fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  secondaryButtonText: { color: "#F4F4F4", fontSize: 15 },
  headerActions: { flexDirection: "row", gap: 16, paddingRight: 4 },
});
