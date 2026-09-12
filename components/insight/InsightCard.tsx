import type { IconName } from "../../types/icon";
import type { CorrelationInsight } from "../../types/insight";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";

const DIRECTION_ICON: Record<CorrelationInsight["direction"], IconName> = {
  positive: "trending-up",
  negative: "trending-down",
  unknown: "help-circle-outline",
};

/**
 * 「練習と成績のつながり」1件のカード。
 * サンプル不足（sufficient=false）は断定せず、非断定トーンで表示する。
 */
export function InsightCard({
  insight,
  onDelete,
}: {
  insight: CorrelationInsight;
  onDelete?: () => void;
}) {
  const accent = insight.sufficient ? "#d08000" : "#71717A";
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon
          name={DIRECTION_ICON[insight.direction]}
          size={18}
          color={accent}
        />
        <Text style={styles.title}>{insight.title}</Text>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} hitSlop={8}>
            <Icon name="trash-outline" size={16} color="#A1A1AA" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.body}>{insight.body}</Text>
      <Text style={styles.meta}>
        {insight.sufficient
          ? `直近${insight.sample_weeks}週の傾向（必ずそうとは限りません）`
          : "データが集まると分かります"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#F4F4F4", fontSize: 15, fontWeight: "700", flex: 1 },
  body: { color: "#F4F4F4", fontSize: 14, lineHeight: 21, marginTop: 10 },
  meta: { color: "#A1A1AA", fontSize: 11, marginTop: 10 },
});
