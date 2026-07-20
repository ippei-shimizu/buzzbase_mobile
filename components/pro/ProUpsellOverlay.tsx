import type { ProFeature } from "../../types/pro";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ProUpsellCard } from "./ProUpsellCard";

interface ProUpsellOverlayProps {
  /** true のとき children をそのまま覆い無しで表示する（Pro/条件付き解放）。 */
  unlocked: boolean;
  children: React.ReactNode;
  feature?: ProFeature;
  title?: string;
  description?: string;
  benefits?: string[];
  ctaLabel?: string;
  /** 省略時はカードを出さず暗幕のみ表示する（同一画面の2ブロック目などCTAを1箇所に絞りたい場合用）。 */
  onPressCta?: () => void;
  /** true のときカード自体を出さず暗幕のみにする（onPressCta の有無に関わらず）。ロック中は代わりに小さな「Pro限定」バッジを出す。 */
  hideCard?: boolean;
  /**
   * Pro 判定の確定前（pro/status 取得中）を表す。true の間は暗幕のみの中立表示にし、
   * カード/バッジを出さない。判定が false 倒しの一瞬にロック訴求がフラッシュするのを防ぐ。
   */
  loading?: boolean;
  /** 暗幕の不透明度（0〜1）。数値等を確実に見せたくない箇所は高めの値を指定する。デフォルト 0.68。 */
  scrimOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * 無料ユーザーには見せたくない既存コンテンツ（記録済みデータ等）や、
 * まだ実装されていない機能のダミーUIを、暗幕 + Pro訴求カードで覆う。
 * `unlocked=false` のときのみ children を非表示側に回す。
 * expo-blur の BlurView は iOS のバージョン/端末によって合成に失敗し中身が透けて見えることがあるため、
 * 不透明度の高い単色暗幕のみで確実に隠す（ブラーには依存しない）。
 */
export function ProUpsellOverlay({
  unlocked,
  children,
  feature,
  title,
  description,
  benefits,
  ctaLabel,
  onPressCta,
  hideCard = false,
  loading = false,
  scrimOpacity = 0.68,
  style,
}: ProUpsellOverlayProps) {
  if (unlocked) return <>{children}</>;

  const showCard = !loading && !hideCard && Boolean(onPressCta);
  const showBadge = !loading && hideCard;

  return (
    <View style={[styles.wrapper, showCard && styles.wrapperWithCard, style]}>
      {/* 暗幕裏の実データ（コンディション値・練習量等）を VoiceOver/TalkBack から隠す。 */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {children}
      </View>
      <View
        style={[
          styles.scrim,
          { backgroundColor: `rgba(26, 26, 26, ${scrimOpacity})` },
        ]}
      />
      {showCard ? (
        <View style={styles.cardContainer}>
          <ProUpsellCard
            feature={feature}
            title={title}
            description={description}
            benefits={benefits}
            ctaLabel={ctaLabel}
            onPressCta={onPressCta as () => void}
            translucent
          />
        </View>
      ) : null}
      {showBadge ? (
        <View style={styles.cardContainer}>
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={11} color="#F4F4F4" />
            <Text style={styles.badgeText}>Pro限定</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  wrapperWithCard: {
    minHeight: 200,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(58, 58, 58, 0.9)",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#F4F4F4",
    fontSize: 11,
    fontWeight: "700",
  },
});
