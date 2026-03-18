import { View, Text, StyleSheet } from "react-native";

interface Props {
  currentStep: number;
}

const steps = ["試合結果", "打撃結果", "投手結果"];

export function StepIndicator({ currentStep }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <View key={label} style={styles.stepRow}>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                isCompleted && styles.labelCompleted,
              ]}
            >
              {label}
            </Text>
            {index < steps.length - 1 && <Text style={styles.arrow}>→</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    color: "#71717A",
    fontWeight: "500",
  },
  labelActive: {
    color: "#d08000",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  labelCompleted: {
    color: "#d08000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  arrow: {
    color: "#71717A",
    fontSize: 20,
    marginHorizontal: 8,
  },
});
