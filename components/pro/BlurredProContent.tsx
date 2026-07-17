import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface BlurredProContentProps {
  /** true のとき children をそのまま覆い無しで表示する（Pro/条件付き解放）。 */
  unlocked: boolean;
  children: React.ReactNode;
  /** 見出し。指定すると説明文・バッジと合わせたカード形式で「Proで何ができるか」を訴求する。 */
  title?: string;
  /** 見出しの下に添える1行程度の補足。 */
  description?: string;
  /** バッジ/CTAボタンの文言。 */
  badgeLabel?: string;
  /** バッジタップ時のハンドラ（指定時のみタップ可能にし PaywallModal 起動などに使う）。 */
  onPressBadge?: () => void;
  /**
   * true のとき暗幕のみ表示しバッジ/CTAを出さない。
   * 同一画面で複数ブロックを覆う場合、ボタンは1箇所だけに出したいときに使う。
   */
  hideBadge?: boolean;
  /** 暗幕の不透明度（0〜1）。数値等を確実に見せたくない箇所は高めの値を指定する。デフォルト 0.82。 */
  scrimOpacity?: number;
}

/**
 * 無料ユーザーには見せたくない既存コンテンツ（記録済みデータ等）を暗幕+ロックバッジで覆う。
 * `unlocked=false` のときのみ children を非表示側に回す。
 * expo-blur の BlurView は iOS のバージョン/端末によって合成に失敗し中身が透けて見えることがあるため、
 * 不透明度の高い単色暗幕のみで確実に隠す（ブラーには依存しない）。
 */
export function BlurredProContent({
  unlocked,
  children,
  title,
  description,
  badgeLabel = "Pro プラン限定",
  onPressBadge,
  hideBadge = false,
  scrimOpacity = 0.82,
}: BlurredProContentProps) {
  if (unlocked) return <>{children}</>;

  const BadgeContainer = onPressBadge ? Pressable : View;
  const badge = (
    <BadgeContainer
      style={styles.badge}
      {...(onPressBadge
        ? { onPress: onPressBadge, accessibilityRole: "button" as const }
        : {})}
    >
      <Ionicons name="lock-closed" size={13} color="#F4F4F4" />
      <Text style={styles.badgeText}>{badgeLabel}</Text>
    </BadgeContainer>
  );

  return (
    <View style={[styles.wrapper, title ? styles.wrapperWithCopy : null]}>
      <View pointerEvents="none">{children}</View>
      <View
        style={[
          styles.scrim,
          { backgroundColor: `rgba(26, 26, 26, ${scrimOpacity})` },
        ]}
      />
      {hideBadge ? null : (
        <View style={styles.overlay}>
          {title ? (
            <View style={styles.copyCard}>
              <Ionicons name="lock-closed" size={18} color="#d08000" />
              <Text style={styles.copyTitle}>{title}</Text>
              {description ? (
                <Text style={styles.copyDescription}>{description}</Text>
              ) : null}
              {badge}
            </View>
          ) : (
            badge
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  wrapperWithCopy: {
    minHeight: 120,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  copyCard: {
    alignItems: "center",
    gap: 6,
  },
  copyTitle: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  copyDescription: {
    color: "#D4D4D8",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 2,
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
