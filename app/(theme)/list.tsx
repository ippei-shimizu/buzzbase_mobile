import type {
  ImprovementTheme,
  ImprovementThemeStatus,
} from "../../types/improvementTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

const TABS: { key: ImprovementThemeStatus; label: string }[] = [
  { key: "open", label: "取組中" },
  { key: "achieved", label: "克服" },
  { key: "archived", label: "アーカイブ" },
];

const EMPTY_MESSAGE: Record<ImprovementThemeStatus, string> = {
  open: "いま取り組む課題を決めると、練習やノートがその課題に束ねられます。",
  achieved: "克服した課題はまだありません。",
  archived: "アーカイブした課題はありません。",
};

export default function ThemeListScreen() {
  const router = useRouter();
  const { themes, isLoading, refetch, isRefreshing } = useImprovementThemes();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [tab, setTab] = useState<ImprovementThemeStatus>("open");

  const themesByStatus = useMemo(() => {
    const buckets: Record<ImprovementThemeStatus, ImprovementTheme[]> = {
      open: [],
      achieved: [],
      archived: [],
    };
    for (const theme of themes) buckets[theme.status].push(theme);
    return buckets;
  }, [themes]);

  const handleAdd = () => {
    // 無料は取組中2つまで。3つ目は Pro 訴求。
    if (
      !hasEntitlement("unlimited_improvement_themes") &&
      themesByStatus.open.length >= 2
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

  const visibleThemes = themesByStatus[tab];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>新しい課題に取り組む</Text>
        </TouchableOpacity>

        <View style={styles.tabBar}>
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label}
                </Text>
                <Text
                  style={[styles.tabCount, active && styles.tabCountActive]}
                >
                  {themesByStatus[item.key].length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
        {visibleThemes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_MESSAGE[tab]}</Text>
          </View>
        ) : (
          visibleThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onPress={() => router.push(`/(theme)/${theme.id}`)}
            />
          ))
        )}
      </ScrollView>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_improvement_themes"
        contextMessage="無料プランで同時に取り組める課題は2件までのため、追加できません。"
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
  const achieved = theme.status === "achieved";
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {theme.title}
          </Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>
              {themeCategoryLabel(theme.category)}
            </Text>
          </View>
        </View>
        {achieved ? (
          <View style={styles.badge}>
            <Ionicons name="trophy" size={12} color="#F4F4F4" />
            <Text style={styles.badgeText}>克服</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#71717A" />
        )}
      </View>
      <View style={styles.statRow}>
        <View style={styles.statChip}>
          <Ionicons name="flame-outline" size={13} color="#d08000" />
          <Text style={styles.statText}>取組 {theme.active_days}日</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="barbell-outline" size={13} color="#d08000" />
          <Text style={styles.statText}>
            練習 {theme.practice_logs_count}件
          </Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="document-text-outline" size={13} color="#d08000" />
          <Text style={styles.statText}>ノート {theme.notes_count}件</Text>
        </View>
      </View>
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
  header: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  tabBar: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  tabActive: { backgroundColor: "#d08000" },
  tabText: { color: "#A1A1AA", fontSize: 14, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },
  tabCount: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  tabCountActive: { color: "#FFFFFF" },
  content: { padding: 16, paddingBottom: 40 },
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitleWrap: { flex: 1, gap: 6 },
  cardTitle: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#2E2E2E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryChipText: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statText: { color: "#D4D4D8", fontSize: 12, fontWeight: "600" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d08000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#F4F4F4", fontSize: 11, fontWeight: "700" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
