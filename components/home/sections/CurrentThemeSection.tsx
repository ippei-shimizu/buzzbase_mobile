import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useImprovementThemes } from "@hooks/useImprovementThemes";

/**
 * ホームの「取り組んでいる課題」カード。
 * open（克服・アーカイブ・削除を除く進行中）の課題をすべて一覧し、
 * それぞれ詳細へ遷移できる。1件も無ければ課題設定を促す空状態を出す。
 */
export function CurrentThemeSection() {
  const router = useRouter();
  const { themes, isLoading } = useImprovementThemes({ status: "open" });

  if (isLoading) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="flag" size={16} color="#d08000" />
        <Text style={styles.headerText}>取り組んでいる課題</Text>
      </View>

      {themes.length === 0 ? (
        <TouchableOpacity onPress={() => router.push("/(theme)/list")}>
          <Text style={styles.empty}>
            いま取り組む課題を決めると、練習やノートがその課題に束ねられます。
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          {themes.map((theme, index) => (
            <TouchableOpacity
              key={theme.id}
              activeOpacity={0.6}
              accessibilityRole="button"
              onPress={() => router.push(`/(theme)/${theme.id}`)}
              style={[styles.row, index === 0 && styles.rowFirst]}
            >
              <View style={styles.rowMain}>
                <Text style={styles.title} numberOfLines={1}>
                  {theme.title}
                </Text>
                <View style={styles.statRow}>
                  <View style={styles.statChip}>
                    <Ionicons name="flame-outline" size={12} color="#d08000" />
                    <Text style={styles.statText}>
                      取組 {theme.active_days}日
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Ionicons
                      name="barbell-outline"
                      size={12}
                      color="#d08000"
                    />
                    <Text style={styles.statText}>
                      練習 {theme.practice_logs_count}
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Ionicons
                      name="document-text-outline"
                      size={12}
                      color="#d08000"
                    />
                    <Text style={styles.statText}>
                      ノート {theme.notes_count}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#71717A" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.manage}
            activeOpacity={0.6}
            accessibilityRole="button"
            onPress={() => router.push("/(theme)/list")}
          >
            <Ionicons name="add" size={14} color="#d08000" />
            <Text style={styles.manageText}>課題を追加・管理</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderTopColor: "#4A4A4A",
    borderTopWidth: 1,
  },
  rowFirst: { borderTopWidth: 0, paddingTop: 10 },
  rowMain: { flex: 1 },
  title: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#2E2E2E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statText: { color: "#D4D4D8", fontSize: 11, fontWeight: "600" },
  empty: { color: "#A1A1AA", fontSize: 13, lineHeight: 20, marginTop: 8 },
  manage: {
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
  manageText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
});
