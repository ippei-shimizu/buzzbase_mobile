import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

interface Props {
  title: string;
  items: SettingsItem[];
}

/**
 * 設定画面のセクション（カテゴリ）コンポーネント。
 * セクション見出し（小さめのグレーラベル）とリスト本体を描画する。
 *
 * @param title セクション見出し（例: "アカウント"）
 * @param items そのセクションに表示する項目の配列
 */
export const SettingsSection = ({ title, items }: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <React.Fragment key={item.title}>
            <TouchableOpacity
              style={styles.item}
              onPress={item.onPress}
              accessibilityRole="button"
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={22} color="#F4F4F4" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "none",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    marginHorizontal: 16,
    backgroundColor: "#27272a",
    borderRadius: 12,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    color: "#71717A",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginHorizontal: 16,
  },
});
