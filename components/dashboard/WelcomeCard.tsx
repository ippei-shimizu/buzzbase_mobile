import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { Button } from "@components/ui/Button";

interface WelcomeCardProps {
  onRecordGame: () => void;
  onInviteFriends: () => void;
  style?: ViewStyle;
}

const STEPS = [
  "最初の試合を記録する",
  "自動で打率・OPS・防御率が計算される",
  "チームメイトを招待してランキングを開始",
];

export const WelcomeCard = ({
  onRecordGame,
  onInviteFriends,
  style,
}: WelcomeCardProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>BUZZ BASEへようこそ</Text>
      <Text style={styles.subtitle}>3ステップで始めよう</Text>

      <View style={styles.steps}>
        {STEPS.map((label, index) => (
          <View key={label} style={styles.step}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="試合を記録する"
          onPress={onRecordGame}
          style={styles.actionButton}
        />
        <Button
          title="友達を招待する"
          onPress={onInviteFriends}
          style={[styles.actionButton, styles.inviteButton]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#424242",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  steps: {
    marginTop: 16,
    gap: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepBadgeText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  stepLabel: {
    color: "#A1A1AA",
    fontSize: 14,
    flex: 1,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    alignSelf: "stretch",
  },
  inviteButton: {
    backgroundColor: "#3f3f46",
  },
});
