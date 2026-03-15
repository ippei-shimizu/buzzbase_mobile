import { View, Text } from "react-native";

interface Props {
  currentStep: number;
}

const steps = ["試合情報", "打撃成績", "投手成績"];

export function StepIndicator({ currentStep }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
    >
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <View
            key={label}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor:
                    isActive || isCompleted ? "#d08000" : "#52525B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#F4F4F4",
                  }}
                >
                  {isCompleted ? "✓" : stepNum}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: isActive ? "#d08000" : "#A1A1AA",
                  marginTop: 4,
                }}
              >
                {label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: isCompleted ? "#d08000" : "#52525B",
                  marginHorizontal: 8,
                  marginBottom: 18,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
