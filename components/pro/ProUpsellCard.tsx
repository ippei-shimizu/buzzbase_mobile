import type { ProFeature } from "../../types/pro";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { PRO_PAYWALL_COPY } from "./PaywallModal";

interface ProUpsellCardProps {
  /** 指定すると PRO_PAYWALL_COPY から title/description/benefits を引く。 */
  feature?: ProFeature;
  /** feature 未指定時は必須（entitlement キーを持たない未実装機能向け）。 */
  title?: string;
  /** benefits が無いときのフォールバックとして表示する単文。 */
  description?: string;
  /** 2〜4行の具体的なメリット箇条書き。指定時は description より優先表示。 */
  benefits?: string[];
  /** CTAボタンの文言。デフォルト "Pro プランを見る"。 */
  ctaLabel?: string;
  onPressCta: () => void;
  /** true のとき ProUpsellOverlay 内で使う半透明カード外観になる。 */
  translucent?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_CTA_LABEL = "Pro プランを見る";

/**
 * Pro専用機能の訴求カード（見出し + 使いたくなるメリット説明 + CTAボタン）。
 * 単独カードとしても、ProUpsellOverlay の中で実UI/ダミーUIの上に重ねる形でも使う。
 */
export function ProUpsellCard({
  feature,
  title,
  description,
  benefits,
  ctaLabel = DEFAULT_CTA_LABEL,
  onPressCta,
  translucent = false,
  style,
}: ProUpsellCardProps) {
  const copy = feature ? PRO_PAYWALL_COPY[feature] : undefined;
  const resolvedTitle = title ?? copy?.title ?? "";
  const resolvedBenefits = benefits ?? copy?.benefits ?? [];
  const resolvedDescription = description ?? copy?.description;

  return (
    <View style={[styles.card, translucent && styles.cardTranslucent, style]}>
      <View style={styles.titleRow}>
        <Icon name="lock-closed" size={16} color="#d08000" />
        <Text style={styles.title}>{resolvedTitle}</Text>
      </View>
      {resolvedBenefits.length > 0 ? (
        <Text style={styles.description}>
          {resolvedBenefits.map((benefit) => `・${benefit}`).join("\n")}
        </Text>
      ) : resolvedDescription ? (
        <Text style={styles.description}>{resolvedDescription}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={onPressCta}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
      >
        <Icon name="lock-closed" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  cardTranslucent: {
    backgroundColor: "rgba(58, 58, 58, 0.9)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    color: "#D4D4D8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "left",
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
