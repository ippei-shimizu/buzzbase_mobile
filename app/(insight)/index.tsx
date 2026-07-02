import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { InsightCard } from "@components/insight/InsightCard";
import { ProComingSoonCard } from "@components/stats/ProComingSoonCard";
import { useCorrelationInsights } from "@hooks/useCorrelationInsights";
import { useEntitlement } from "@hooks/useEntitlement";

export default function InsightScreen() {
  const router = useRouter();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const isPro = hasEntitlement("correlation_insights");
  const { insights, isLoading } = useCorrelationInsights({ enabled: isPro });

  if (isProLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!isPro) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ProComingSoonCard
          title="練習と成績の関係を発見"
          description="素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。"
          onPress={() => router.push("/pro")}
        >
          <View style={styles.dummy}>
            <Text style={styles.dummyText}>
              素振りが多い週は、打率が高い傾向があります。
            </Text>
          </View>
        </ProComingSoonCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        あなたの練習・コンディションと成績の傾向です。因果ではなく、続けるほど精度が上がります。
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#d08000" style={styles.loader} />
      ) : (
        insights.map((insight) => (
          <InsightCard key={insight.key} insight={insight} />
        ))
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
});
