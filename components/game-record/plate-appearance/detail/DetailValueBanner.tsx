import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

/**
 * Step3 上部の価値訴求バナー。
 * 「詳細を入れると何が見られるか」を 1 文で伝え、
 * 「全項目を埋めなければ」というプレッシャーを下げるため
 * 「気になる項目だけ記録すれば OK」を明示する。
 */
export function DetailValueBanner() {
  return (
    <View style={styles.banner}>
      <Ionicons name="bulb-outline" size={20} color="#d08000" />
      <View style={styles.body}>
        <Text style={styles.headline}>
          詳細を記録すると、球質別の打率や状況別の分析が見られます
        </Text>
        <Text style={styles.subline}>あとから追記もできます</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#3a3024",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#d08000",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  body: {
    flex: 1,
  },
  headline: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 18,
  },
  subline: {
    color: "#D4D4D8",
    fontSize: 12,
    marginTop: 4,
  },
});
