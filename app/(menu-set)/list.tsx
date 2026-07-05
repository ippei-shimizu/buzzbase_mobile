import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useMenuSets, useMenuSetMutations } from "@hooks/useMenuSets";

export default function MenuSetListScreen() {
  const router = useRouter();
  const { menuSets, isLoading } = useMenuSets();
  const { deleteMenuSet } = useMenuSetMutations();

  const handleDelete = (id: number, name: string) => {
    Alert.alert("削除しますか？", name, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteMenuSet(id) },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {menuSets.length === 0 ? (
        <Text style={styles.empty}>
          よく組む練習をセットにしておくと、割り当てや週プランでそのまま使えます
        </Text>
      ) : (
        menuSets.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={styles.card}
            onPress={() => router.push(`/(menu-set)/edit?id=${set.id}`)}
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
            <TouchableOpacity
              hitSlop={8}
              onPress={() => handleDelete(set.id, set.name)}
            >
              <Ionicons name="trash-outline" size={20} color="#71717A" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(menu-set)/edit")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>新しいセットを作る</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
