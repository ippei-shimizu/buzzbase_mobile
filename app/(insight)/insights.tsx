import type { CorrelationInsight } from "../../types/insight";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { InsightCard } from "@components/insight/InsightCard";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProComingSoonCard } from "@components/stats/ProComingSoonCard";
import {
  useCorrelationInsights,
  useInsightCombinationMutations,
} from "@hooks/useCorrelationInsights";
import { useEntitlement } from "@hooks/useEntitlement";

export default function InsightScreen() {
  const router = useRouter();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const isPro = hasEntitlement("correlation_insights");
  const { insights, isLoading } = useCorrelationInsights({ enabled: isPro });
  const { deleteCombination } = useInsightCombinationMutations();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const confirmDelete = (insight: CorrelationInsight) => {
    if (insight.id == null) return;
    Alert.alert("この組み合わせを削除しますか？", insight.title, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCombination(insight.id as number);
          } catch {
            Alert.alert("削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (isProLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!isPro) {
    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <ProComingSoonCard
            title="練習と成績の関係を発見"
            description="素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。"
            badgeLabel="Pro プラン限定"
            onPress={() => setPaywallOpen(true)}
          >
            <View style={styles.dummy}>
              <Text style={styles.dummyText}>
                素振りが多い週は、打率が高い傾向があります。
              </Text>
            </View>
          </ProComingSoonCard>
        </ScrollView>
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setPaywallOpen(false)}
          feature="correlation_insights"
        />
      </>
    );
  }

  const customs = insights.filter((insight) => insight.id != null);
  const presets = insights.filter((insight) => insight.id == null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        あなたの練習・コンディションと成績の傾向です。必ずそうなるとは限りませんが、続けるほど精度が上がります。
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/(insight)/create")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.createButtonText}>組み合わせを作る</Text>
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator size="large" color="#d08000" style={styles.loader} />
      ) : (
        <>
          {customs.length > 0 ? (
            <>
              <Text style={styles.sectionHeading}>自作</Text>
              {customs.map((insight) => (
                <InsightCard
                  key={insight.key}
                  insight={insight}
                  onDelete={() => confirmDelete(insight)}
                />
              ))}
            </>
          ) : null}
          <Text style={styles.sectionHeading}>おすすめ</Text>
          {presets.map((insight) => (
            <InsightCard key={insight.key} insight={insight} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  lead: { color: "#A1A1AA", fontSize: 13, lineHeight: 20, marginBottom: 16 },
  loader: { marginTop: 24 },
  dummy: { padding: 20 },
  dummyText: { color: "#F4F4F4", fontSize: 14 },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  createButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  sectionHeading: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
});
