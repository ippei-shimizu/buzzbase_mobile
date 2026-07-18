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
import { PaywallModal } from "@components/pro/PaywallModal";
import {
  CATEGORY_ICON,
  PRACTICE_CATEGORIES,
  PRACTICE_MENU_FREE_LIMIT,
} from "@constants/practice";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  usePracticeMenuMutations,
  usePracticeMenus,
} from "@hooks/usePracticeMenus";

export default function PracticeMenuListScreen() {
  const router = useRouter();
  const { menus, isLoading } = usePracticeMenus();
  const { deleteMenu } = usePracticeMenuMutations();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const handleAdd = () => {
    // 無料は3件まで（back の PlanLimits::PRACTICE_MENU_FREE_LIMIT と対応）。
    if (
      !hasEntitlement("unlimited_practice_menus") &&
      menus.length >= PRACTICE_MENU_FREE_LIMIT
    ) {
      setPaywallOpen(true);
      return;
    }
    router.push("/(practice-menu)/form");
  };

  const handleEdit = (id: number) =>
    router.push({
      pathname: "/(practice-menu)/form",
      params: { id: String(id) },
    });

  const handleDelete = (id: number, name: string) => {
    Alert.alert("このメニューを削除しますか？", name, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenu(id);
          } catch {
            Alert.alert("削除に失敗しました");
          }
        },
      },
    ]);
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
      <ScrollView contentContainerStyle={styles.content}>
        {menus.length === 0 ? (
          <Text style={styles.emptyText}>まだ練習メニューがありません</Text>
        ) : (
          PRACTICE_CATEGORIES.map((category) => {
            const inCategory = menus.filter(
              (menu) => menu.category === category.key,
            );
            if (inCategory.length === 0) return null;
            return (
              <View key={category.key} style={styles.group}>
                <View style={styles.groupTitleRow}>
                  <Ionicons
                    name={CATEGORY_ICON[category.key]}
                    size={15}
                    color="#d08000"
                  />
                  <Text style={styles.groupTitle}>{category.label}</Text>
                </View>
                {inCategory.map((menu) => (
                  <TouchableOpacity
                    key={menu.id}
                    style={styles.card}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    onPress={() => handleEdit(menu.id)}
                  >
                    <Text style={styles.cardTitle}>{menu.name}</Text>
                    <Ionicons name="pencil" size={16} color="#A1A1AA" />
                    <TouchableOpacity
                      onPress={() => handleDelete(menu.id, menu.name)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#A1A1AA"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#F4F4F4" />
          <Text style={styles.addButtonText}>メニューを作る</Text>
        </TouchableOpacity>
      </ScrollView>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_practice_menus"
      />
    </View>
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
  emptyText: { color: "#A1A1AA", fontSize: 13, marginBottom: 12 },
  group: { marginBottom: 20 },
  groupTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  groupTitle: { color: "#A1A1AA", fontSize: 13, fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "600", flex: 1 },
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
  addButtonText: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
});
