import type { IconName } from "../../types/icon";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";
import { useStoreReview } from "@hooks/useStoreReview";

interface FooterLinkProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

function FooterLink({ icon, label, onPress }: FooterLinkProps) {
  return (
    <TouchableOpacity
      style={styles.link}
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <Icon name={icon} size={18} color="#D4D4D8" />
      <Text style={styles.linkText}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * マイページ下部に常設する、ご意見・ご要望とストアレビューへの導線。
 * ストアのレビュー画面を直接開くため、OS のレビューダイアログの回数制限とは関係なく何度でも押せる。
 */
export function FeedbackFooter() {
  const router = useRouter();
  const { openStoreReviewPage } = useStoreReview();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>BUZZ BASE をより良くするために</Text>
      <View style={styles.links}>
        <FooterLink
          icon="chatbubble-outline"
          label="ご意見・ご要望を送る"
          onPress={() =>
            router.push({
              pathname: "/(profile)/contact",
              params: { subject: "feedback" },
            })
          }
        />
        <FooterLink
          icon="star-outline"
          label="レビューで応援する"
          onPress={() => {
            void openStoreReviewPage();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#27272a",
    borderRadius: 12,
  },
  heading: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  links: {
    flexDirection: "row",
    gap: 8,
  },
  link: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
  },
  linkText: {
    color: "#D4D4D8",
    fontSize: 13,
    fontWeight: "600",
  },
});
