import type { OnboardingStep } from "@constants/onboarding";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OnboardingIllustrationView } from "./illustrations";

interface Props {
  width: number;
  step: OnboardingStep;
}

export const OnboardingSlide = ({ width, step }: Props) => (
  <View style={[styles.container, { width }]}>
    <View style={styles.illustrationFrame}>
      <OnboardingIllustrationView name={step.illustration} size={220} />
    </View>
    <Text style={styles.title}>{step.title}</Text>
    <Text style={styles.copy}>{step.copy}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  illustrationFrame: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  copy: {
    color: "#A1A1AA",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
