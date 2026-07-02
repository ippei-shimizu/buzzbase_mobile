import type { ImprovementTheme } from "../../types/improvementTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { themeCategoryLabel } from "@constants/improvementTheme";
import { useEntitlement } from "@hooks/useEntitlement";
import { useImprovementThemes } from "@hooks/useImprovementThemes";

export default function ThemeListScreen() {
  const router = useRouter();
  const { themes, isLoading, refetch, isRefreshing } = useImprovementThemes();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const openThemes = themes.filter((theme) => theme.status === "open");
  const historyThemes = themes.filter((theme) => theme.status !== "open");

  const handleAdd = () => {
    // 無料は取組中1つまで。2つ目は Pro 訴求。
    if (
      !hasEntitlement("unlimited_improvement_themes") &&
      openThemes.length >= 1
    ) {
      setPaywallOpen(true);
      return;
    }
    router.push("/(theme)/new");
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#d08000"
          />
        }
      >
        <Text style={styles.sectionTitle}>取組中の課題</Text>
        {openThemes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              いま取り組む課題を決めると、練習やノートがその課題に束ねられます。
            </Text>
          </View>
        ) : (
          openThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onPress={() => router.push(`/(theme)/${theme.id}`)}
            />
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#1A1A1A" />
          <Text style={styles.addButtonText}>新しい課題に取り組む</Text>
        </TouchableOpacity>

        {historyThemes.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, styles.historyTitle]}>
              克服・アーカイブ
            </Text>
            {historyThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onPress={() => router.push(`/(theme)/${theme.id}`)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_improvement_themes"
      />
    </View>
  );
}

function ThemeCard({
  theme,
  onPress,
}: {
  theme: ImprovementTheme;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{theme.title}</Text>
        {theme.status === "achieved" ? (
          <View style={styles.badge}>
            <Ionicons name="trophy" size={12} color="#1A1A1A" />
            <Text style={styles.badgeText}>克服</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.cardMeta}>
        {themeCategoryLabel(theme.category)}・取組{theme.active_days}日・練習
        {theme.practice_logs_count}・ノート{theme.notes_count}
      </Text>
    </TouchableOpacity>
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
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  historyTitle: { marginTop: 28 },
  empty: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
  },
  emptyText: { color: "#A1A1AA", fontSize: 13, lineHeight: 20 },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { color: "#F4F4F4", fontSize: 16, fontWeight: "700", flex: 1 },
  cardMeta: { color: "#A1A1AA", fontSize: 12, marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d08000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#1A1A1A", fontSize: 11, fontWeight: "700" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  addButtonText: { color: "#1A1A1A", fontSize: 15, fontWeight: "700" },
});
