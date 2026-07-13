import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface BlurredProContentProps {
  /** true のとき children をそのままブラー無しで表示する（Pro/条件付き解放）。 */
  unlocked: boolean;
  children: React.ReactNode;
  /** ブラー上に出すバッジ文言。 */
  badgeLabel?: string;
  /** バッジタップ時のハンドラ（指定時のみタップ可能にし PaywallModal 起動などに使う）。 */
  onPressBadge?: () => void;
}

/**
 * 無料ユーザーには見せたくない既存コンテンツ（記録済みデータ等）をブラー+暗幕+ロックバッジで覆う。
 * `unlocked=false` のときのみ children を非表示側に回し、iOS の省電力モード等でブラーが
 * 無効化されても内容が透けないよう暗幕を必ず重ねる。
 */
export function BlurredProContent({
  unlocked,
  children,
  badgeLabel = "Pro プラン限定",
  onPressBadge,
}: BlurredProContentProps) {
  if (unlocked) return <>{children}</>;

  const BadgeContainer = onPressBadge ? Pressable : View;
  return (
    <View style={styles.wrapper}>
      <View pointerEvents="none">{children}</View>
      <View style={styles.scrim} />
      <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay}>
        <BadgeContainer
          style={styles.badge}
          {...(onPressBadge
            ? { onPress: onPressBadge, accessibilityRole: "button" as const }
            : {})}
        >
          <Ionicons name="lock-closed" size={13} color="#F4F4F4" />
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </BadgeContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#d08000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
});
