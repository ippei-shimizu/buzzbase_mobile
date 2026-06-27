import type { PracticeMenu } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { type ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MenuCard } from "@components/practice/MenuCard";
import { PRACTICE_CATEGORIES } from "@constants/practice";
import { usePracticeMenus } from "@hooks/usePracticeMenus";

export default function PracticeMenuListScreen() {
  const router = useRouter();
  const { menus, isLoading } = usePracticeMenus();

  const goAmount = (menu: PracticeMenu) =>
    router.push({
      pathname: "/(practice-record)/amount-input",
      params: { menuId: String(menu.id) },
    });

  const goNewMenu = () => router.push("/(practice-record)/menu-new");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (menus.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>まだ練習メニューがありません</Text>
        <Text style={styles.emptyText}>
          よくやる練習を登録すると、ワンタップで記録できます
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={goNewMenu}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>最初のメニューを作る</Text>
        </TouchableOpacity>
        <Text style={styles.exampleText}>
          例）素振り ・ ランニング ・ ティーバッティング
        </Text>
      </View>
    );
  }

  const favorites = menus.filter((menu) => menu.is_favorite);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {favorites.length > 0 ? (
        <Section title="★ お気に入り">
          {favorites.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onPress={() => goAmount(menu)}
            />
          ))}
        </Section>
      ) : null}

      {PRACTICE_CATEGORIES.map((category) => {
        const items = menus.filter((menu) => menu.category === category.key);
        if (items.length === 0) return null;
        return (
          <Section key={category.key} title={category.label}>
            {items.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onPress={() => goAmount(menu)}
              />
            ))}
          </Section>
        );
      })}

      <TouchableOpacity style={styles.addRow} onPress={goNewMenu}>
        <Ionicons name="add" size={18} color="#d08000" />
        <Text style={styles.addRowText}>新しいメニューを追加</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 16 },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  addRowText: { color: "#d08000", fontSize: 15, fontWeight: "600" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  exampleText: { color: "#71717A", fontSize: 12, marginTop: 16 },
});
