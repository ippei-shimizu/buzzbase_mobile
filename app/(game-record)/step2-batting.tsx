import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useGameRecord } from "@hooks/useGameRecord";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { BattingForm } from "@components/game-record/BattingForm";

export default function Step2BattingScreen() {
  const router = useRouter();
  const { submitStep2 } = useGameRecord();
  const store = useGameRecordStore();
  const [errors, setErrors] = useState<string[]>([]);

  const handleFieldChange = (field: string, value: number) => {
    store.setField(field as keyof typeof store, value as never);
  };

  const handleSubmit = () => {
    setErrors([]);
    submitStep2.mutate(undefined, {
      onSuccess: () => {
        router.push("/(game-record)/step3-pitching");
      },
      onError: (error) => {
        setErrors([
          error instanceof Error ? error.message : "エラーが発生しました",
        ]);
      },
    });
  };

  const handleSkipPitching = () => {
    setErrors([]);
    submitStep2.mutate(undefined, {
      onSuccess: () => {
        router.push("/(game-record)/summary");
      },
      onError: (error) => {
        setErrors([
          error instanceof Error ? error.message : "エラーが発生しました",
        ]);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2E2E2E" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <StepIndicator currentStep={2} />
      <BattingForm
        battingBoxes={store.battingBoxes}
        runsBattedIn={store.runsBattedIn}
        run={store.run}
        battingError={store.battingError}
        stealingBase={store.stealingBase}
        caughtStealing={store.caughtStealing}
        isSubmitting={submitStep2.isPending}
        errors={errors}
        onPositionChange={(index, id) =>
          store.updateBattingBoxPosition(index, id)
        }
        onResultChange={(index, id) => store.updateBattingBoxResult(index, id)}
        onAddBox={() => store.addBattingBox()}
        onDeleteBox={(index) => store.removeBattingBox(index)}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onSkipPitching={handleSkipPitching}
      />
    </KeyboardAvoidingView>
  );
}
