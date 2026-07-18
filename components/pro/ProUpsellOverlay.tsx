import type { ProFeature } from "../../types/pro";
import React from "react";
import { StyleSheet, View } from "react-native";
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
  /** true のときカード自体を出さず暗幕のみにする（onPressCta の有無に関わらず）。 */
  hideCard?: boolean;
  /** 暗幕の不透明度（0〜1）。数値等を確実に見せたくない箇所は高めの値を指定する。デフォルト 0.82。 */
  scrimOpacity?: number;
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
  scrimOpacity = 0.82,
}: ProUpsellOverlayProps) {
  if (unlocked) return <>{children}</>;

  const showCard = !hideCard && Boolean(onPressCta);

  return (
    <View style={[styles.wrapper, showCard && styles.wrapperWithCard]}>
      <View pointerEvents="none">{children}</View>
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
    minHeight: 120,
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
});
