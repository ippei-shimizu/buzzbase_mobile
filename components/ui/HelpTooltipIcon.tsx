import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  /** ツールチップのタイトル（モーダル上部に primary 色で表示） */
  title: string;
  /** ツールチップ本文。`\n` で改行可 */
  message: string;
  /** アイコンの色（デフォルトはサブテキスト色）*/
  iconColor?: string;
  /** アイコンサイズ（デフォルト 18px）*/
  size?: number;
  /** スクリーンリーダー向け補足。未指定時は `{title}の説明を表示` */
  accessibilityLabel?: string;
}

/**
 * タップで説明を Modal バブルで表示する汎用ヘルプアイコン。
 * 操作ガイドや用語説明などを画面に常駐させずに済ませたいとき、見出しの
 * 横に配置して使う。背景タップで閉じる。
 */
export function HelpTooltipIcon({
  title,
  message,
  iconColor = "#A1A1AA",
  size = 18,
  accessibilityLabel,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${title}の説明を表示`}
        onPress={() => setVisible(true)}
        hitSlop={8}
      >
        <Ionicons name="help-circle-outline" size={size} color={iconColor} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
          accessible={false}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleTitle}>{title}</Text>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  bubble: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  bubbleTitle: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  bubbleText: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 19,
  },
});
