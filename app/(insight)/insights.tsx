import type { CorrelationInsight } from "../../types/insight";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { InsightCard } from "@components/insight/InsightCard";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellCard } from "@components/pro/ProUpsellCard";
import { SampleDataLabel } from "@components/pro/SampleDataLabel";
import { SkeletonList } from "@components/ui/Skeleton";
import {
  useCorrelationInsights,
  useInsightCombinationMutations,
} from "@hooks/useCorrelationInsights";
import { useEntitlement } from "@hooks/useEntitlement";

// 相関インサイトは Pro 限定機能。無料ユーザーには実データの代わりにこのサンプルを見せ、
// 複数の傾向を発見できる機能だと伝わるよう3件表示する。
const DUMMY_INSIGHTS: CorrelationInsight[] = [
  {
    key: "sample-1",
    id: null,
    title: "素振りと打率の関係",
    body: "素振りが多い週は、打率が高い傾向があります。",
    metric: "batting_average",
    dimension: "total_swings",
    direction: "positive",
    strength: "strong",
    sample_weeks: 8,
    sufficient: true,
  },
  {
    key: "sample-2",
    id: null,
    title: "睡眠時間とコンディションの関係",
    body: "睡眠時間が短い週は、疲労度の自己評価が高くなる傾向があります。",
    metric: "fatigue_level_avg",
    dimension: "sleep_hours_avg",
    direction: "negative",
    strength: "moderate",
    sample_weeks: 6,
    sufficient: true,
  },
  {
    key: "sample-3",
    id: null,
    title: "練習日数と三振の関係",
    body: "練習日数が多い週は、三振の割合が低くなる傾向があります。",
    metric: "strikeout_rate",
    dimension: "practice_days",
    direction: "negative",
    strength: "strong",
    sample_weeks: 10,
    sufficient: true,
  },
];

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

  // Pro 判定とデータ取得を1つの待ち状態にまとめる。別々に出すと二度点滅して見える。
  if (isProLoading || (isPro && isLoading)) {
    return (
      <View style={styles.skeleton}>
        <SkeletonList count={4} itemHeight={88} />
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
          <ProUpsellCard
            feature="correlation_insights"
            onPressCta={() => setPaywallOpen(true)}
          />
          <SampleDataLabel />
          <View pointerEvents="none" style={styles.dummyList}>
            {DUMMY_INSIGHTS.map((insight) => (
              <InsightCard key={insight.key} insight={insight} />
            ))}
          </View>
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
        <Icon name="add" size={18} color="#FFFFFF" />
        <Text style={styles.createButtonText}>組み合わせを作る</Text>
      </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  skeleton: { flex: 1, backgroundColor: "#2E2E2E", padding: 16, gap: 12 },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  lead: { color: "#A1A1AA", fontSize: 13, lineHeight: 20, marginBottom: 16 },
  dummyList: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525B",
  },
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
