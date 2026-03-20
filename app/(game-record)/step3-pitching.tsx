import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { useGameRecord } from "@hooks/useGameRecord";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { PitchingForm } from "@components/game-record/PitchingForm";

export default function Step3PitchingScreen() {
  const router = useRouter();
  const { submitStep3 } = useGameRecord();
  const store = useGameRecordStore();
  const [errors, setErrors] = useState<string[]>([]);

  const handleFieldChange = (field: string, value: number | boolean) => {
    store.setField(field as keyof typeof store, value as never);
  };

  const handleSubmit = () => {
    setErrors([]);
    submitStep3.mutate(undefined, {
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
      <StepIndicator currentStep={3} />
      <PitchingForm
        win={store.win}
        loss={store.loss}
        hold={store.hold}
        saves={store.saves}
        inningsPitchedWhole={store.inningsPitchedWhole}
        inningsPitchedFraction={store.inningsPitchedFraction}
        numberOfPitches={store.numberOfPitches}
        gotToTheDistance={store.gotToTheDistance}
        runAllowed={store.runAllowed}
        earnedRun={store.earnedRun}
        hitsAllowed={store.hitsAllowed}
        homeRunsHit={store.homeRunsHit}
        strikeouts={store.strikeouts}
        pitchingBaseOnBalls={store.pitchingBaseOnBalls}
        pitchingHitByPitch={store.pitchingHitByPitch}
        isSubmitting={submitStep3.isPending}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
