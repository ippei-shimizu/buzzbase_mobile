import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { GoalProgressBar } from "@components/goal/GoalProgressBar";
import { useGoalMutations, useGoals } from "@hooks/useGoals";

export default function GoalListScreen() {
  const router = useRouter();
  const { goals, isLoading } = useGoals();
  const { deleteGoal } = useGoalMutations();

  const handleDelete = (id: number, title: string) =>
    Alert.alert("削除しますか？", title, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteGoal(id) },
    ]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {goals.length === 0 ? (
        <Text style={styles.empty}>
          目標を設定すると、達成度がここに表示されます
        </Text>
      ) : (
        goals.map((goal) => (
          <View key={goal.id} style={styles.card}>
            <View style={styles.cardBar}>
              <GoalProgressBar goal={goal} />
            </View>
            <TouchableOpacity onPress={() => handleDelete(goal.id, goal.title)}>
              <Ionicons name="trash-outline" size={18} color="#71717A" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(goal)/new")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>新しい目標を追加</Text>
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
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  cardBar: { flex: 1 },
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
