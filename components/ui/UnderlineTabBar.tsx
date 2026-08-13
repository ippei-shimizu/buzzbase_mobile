import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * 成績画面（打撃/投手切替）と同じアンダーラインタブ。
 * 選択中はタブ下線が gold（#d08000）・テキストが白になる。
 */
export function UnderlineTabBar({ options, selectedIndex, onSelect }: Props) {
  return (
    <View style={styles.tabBar}>
      {options.map((option, index) => {
        const isActive = index === selectedIndex;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onSelect(index)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#2E2E2E",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#F4F4F4",
  },
});
