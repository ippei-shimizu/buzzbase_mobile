import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProComingSoonCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** カードタップ時のハンドラ（課金意向シグナルの計測用）。未指定ならタップ不可。 */
  onPress?: () => void;
  /** 覆いの上に出すバッジ文言。デフォルトは未リリース機能向けの「準備中」表記。 */
  badgeLabel?: string;
}

/**
 * Pro プラン限定機能のダミー体験カード。
 * タイトル・説明は読める状態のまま、children（ダミー body）を不透明暗幕で覆い、
 * その上にバッジを重ねて機能の事前訴求を行う。
 * expo-blur の BlurView は iOS のバージョン/端末によって合成に失敗し中身が透けて見えることがあるため、
 * ブラーには依存せず単色の不透明暗幕のみで確実に隠す。
 */
export function ProComingSoonCard({
  title,
  description,
  children,
  onPress,
  badgeLabel = "Pro プラン (準備中)",
}: ProComingSoonCardProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      style={styles.container}
      {...(onPress
        ? {
            onPress,
            accessibilityRole: "button" as const,
            accessibilityLabel: `${title}（${badgeLabel}）`,
          }
        : {})}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.previewWrapper} pointerEvents="none">
        {children}
        <View style={styles.scrim} />
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={13} color="#F4F4F4" />
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  previewWrapper: {
    position: "relative",
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 26, 0.82)",
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
