import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CalendarIcon } from "@components/icon/CalendarIcon";
import { NoteIcon } from "@components/icon/NoteIcon";

interface Props {
  visible: boolean;
  opacity: Animated.Value;
  onClose: () => void;
}

/**
 * グローバルハンバーガーメニューの本体。
 *
 * `Modal` で画面全体（ヘッダーを含む）を覆い、メニュー外の任意の場所
 * （ヘッダーやコンテンツエリア）をタップしてもメニューを閉じる。
 *
 * メニュー本体はヘッダーの直下（`useHeaderHeight()` で動的に算出）に配置し、
 * 親 (`useGlobalMenu`) から渡される `Animated.Value` で opacity フェードする。
 *
 * 表示項目は3つ:
 *   - 野球ノート
 *   - シーズン管理
 *   - 設定
 */
export const GlobalMenuOverlay = ({ visible, opacity, onClose }: Props) => {
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const handleSelect = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="メニューを閉じる"
      >
        <Animated.View
          style={[styles.container, { top: headerHeight + 4, opacity }]}
        >
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(() => router.push("/(profile)/notes"))}
            accessibilityRole="menuitem"
          >
            <NoteIcon size={20} color="#F4F4F4" />
            <Text style={styles.itemText}>野球ノート</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              handleSelect(() => router.push("/(profile)/seasons"))
            }
            accessibilityRole="menuitem"
          >
            <CalendarIcon size={20} color="#F4F4F4" />
            <Text style={styles.itemText}>シーズン管理</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(() => router.push("/settings"))}
            accessibilityRole="menuitem"
          >
            <Ionicons name="settings-outline" size={20} color="#F4F4F4" />
            <Text style={styles.itemText}>設定</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  itemText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#4A4A4A",
    marginHorizontal: 12,
  },
});
