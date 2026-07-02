import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useImprovementThemes } from "@hooks/useImprovementThemes";

/**
 * ホームの「今取り組んでいる課題」カード。
 * open な課題があればサマリーを、無ければ課題設定を促す空状態を出す。
 */
export function CurrentThemeSection() {
  const router = useRouter();
  const { themes, isLoading } = useImprovementThemes({ status: "open" });

  if (isLoading) return null;

  const theme = themes[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(theme ? `/(theme)/${theme.id}` : "/(theme)/list")
      }
    >
      <View style={styles.header}>
        <Ionicons name="flag" size={16} color="#d08000" />
        <Text style={styles.headerText}>取り組んでいる課題</Text>
      </View>
      {theme ? (
        <>
          <Text style={styles.title}>{theme.title}</Text>
          <Text style={styles.meta}>
            取組{theme.active_days}日・練習{theme.practice_logs_count}・ノート
            {theme.notes_count}
          </Text>
        </>
      ) : (
        <Text style={styles.empty}>
          いま取り組む課題を決めると、練習やノートがその課題に束ねられます。
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  title: { color: "#F4F4F4", fontSize: 16, fontWeight: "700", marginTop: 8 },
  meta: { color: "#A1A1AA", fontSize: 12, marginTop: 6 },
  empty: { color: "#A1A1AA", fontSize: 13, lineHeight: 20, marginTop: 8 },
});
