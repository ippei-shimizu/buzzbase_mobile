import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * ホーム最上部の主記録導線。「練習を記録」「野球ノートを記録」を並べて常に最上段に置く。
 * セクションカードで囲わず、毎日の起点として最も押しやすい位置に固定する。
 */
export function RecordButtonsSection() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(practice-record)/daily")}
        >
          <Ionicons name="barbell-outline" size={22} color="#FFFFFF" />
          <Text style={styles.text}>練習を記録</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(note)/new")}
        >
          <Ionicons name="create-outline" size={22} color="#FFFFFF" />
          <Text style={styles.text}>野球ノートを記録</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.listLink}
        onPress={() => router.push("/(records)/list")}
      >
        <Ionicons name="list-outline" size={16} color="#d08000" />
        <Text style={styles.listLinkText}>練習記録・野球ノートの一覧</Text>
        <Ionicons name="chevron-forward" size={16} color="#d08000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  row: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 18,
  },
  text: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  listLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
  },
  listLinkText: { color: "#d08000", fontSize: 13, fontWeight: "600" },
});
