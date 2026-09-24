import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";

interface PaywallHeaderProps {
  /** プラン画面のときだけ価値画面へ戻る導線を出す。 */
  showBack: boolean;
  onBack: () => void;
  onClose: () => void;
}

/**
 * Paywall 上部のヘッダー。全画面表示のため閉じるボタンを右上に固定で置く。
 * 自動表示される Paywall には常に閉じる導線が必要（App Store 審査ガイドライン）。
 */
export function PaywallHeader({
  showBack,
  onBack,
  onClose,
}: PaywallHeaderProps) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="戻る"
          hitSlop={8}
        >
          <Icon name="chevron-back" size={24} color="#F4F4F4" />
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
      <TouchableOpacity
        onPress={onClose}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="閉じる"
        hitSlop={8}
      >
        <Icon name="close" size={24} color="#F4F4F4" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
