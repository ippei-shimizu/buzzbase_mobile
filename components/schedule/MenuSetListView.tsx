import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { MENU_SET_FREE_LIMIT } from "@constants/menuSet";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMenuSets } from "@hooks/useMenuSets";

/**
 * 練習プランセット（MenuSet）一覧。練習プラン画面（(menu-set)/list.tsx）のデフォルトタブ。
 */
export function MenuSetListView() {
  const router = useRouter();
  const { menuSets, isLoading } = useMenuSets();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const handleAdd = () => {
    // 無料は2件まで（back の PlanLimits::MENU_SET_FREE_LIMIT と対応）。
    if (
      !hasEntitlement("unlimited_menu_sets") &&
      menuSets.length >= MENU_SET_FREE_LIMIT
    ) {
      setPaywallOpen(true);
      return;
    }
    router.push("/(menu-set)/edit");
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
        {menuSets.length === 0 ? (
          <Text style={styles.empty}>
            よく組む練習をセットにしておくと、予定登録や週プランでそのまま使えます
          </Text>
        ) : (
          menuSets.map((set) => (
            <TouchableOpacity
              key={set.id}
              style={styles.card}
              onPress={() => router.push(`/(menu-set)/${set.id}`)}
            >
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>{set.name}</Text>
                {set.items.length > 0 ? (
                  <Text style={styles.cardItems} numberOfLines={2}>
                    {set.items.map((item) => item.name).join(" / ")}
                  </Text>
                ) : (
                  <Text style={styles.cardEmpty}>メニュー未設定</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>新しい練習プランセットを作る</Text>
        </TouchableOpacity>
      </ScrollView>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_menu_sets"
        contextMessage={`無料プランで作成できるメニューセットは${MENU_SET_FREE_LIMIT}件までのため、追加できません。`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  content: { padding: 16, paddingBottom: 40 },
  empty: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  cardMain: { flex: 1 },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  cardItems: { color: "#A1A1AA", fontSize: 13, marginTop: 4 },
  cardEmpty: { color: "#71717A", fontSize: 12, marginTop: 4 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
