import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMenuSetMutations, useMenuSets } from "@hooks/useMenuSets";

export default function MenuSetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const menuSetId = Number(params.id);
  const { menuSets, isLoading } = useMenuSets();
  const { deleteMenuSet } = useMenuSetMutations();
  const menuSet = menuSets.find((set) => set.id === menuSetId);

  const goEdit = () => router.push(`/(menu-set)/edit?id=${menuSetId}`);

  const handleDelete = () => {
    if (!menuSet) return;
    Alert.alert("メニューセットを削除しますか？", menuSet.name, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuSet(menuSetId);
            router.back();
          } catch {
            Alert.alert("削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (isLoading && !menuSet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!menuSet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>メニューセットが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={goEdit}>
                <Ionicons name="create-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#F31260" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Text style={styles.title}>{menuSet.name}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メニュー</Text>
        {menuSet.items.length === 0 ? (
          <Text style={styles.emptyText}>メニュー未設定</Text>
        ) : (
          menuSet.items.map((item) => (
            <View key={item.practice_menu_id} style={styles.menuRow}>
              <Ionicons name="ellipse" size={6} color="#d08000" />
              <Text style={styles.menuText}>
                {item.name}
                {item.target_value != null
                  ? `  ${item.target_value}${item.unit_label ?? ""}`
                  : ""}
              </Text>
            </View>
          ))
        )}
      </View>

      {menuSet.note ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メモ</Text>
          <Text style={styles.noteText}>{menuSet.note}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 48 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  notFound: { color: "#A1A1AA", fontSize: 14 },
  headerActions: { flexDirection: "row", gap: 16, paddingRight: 4 },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "700" },
  section: { marginTop: 20 },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: { color: "#71717A", fontSize: 13 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  menuText: { color: "#F4F4F4", fontSize: 14 },
  noteText: { color: "#F4F4F4", fontSize: 14, lineHeight: 21 },
});
