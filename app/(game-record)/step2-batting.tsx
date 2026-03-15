import { useState } from "react";
import { View } from "react-native";
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
    // 安打関連が変わったらtotalBasesを再計算
    if (["hit", "twoBaseHit", "threeBaseHit", "homeRun"].includes(field)) {
      setTimeout(() => store.computeTotalBases(), 0);
    }
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
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <StepIndicator currentStep={2} />
      <BattingForm
        plateAppearances={store.plateAppearances}
        timesAtBat={store.timesAtBat}
        atBats={store.atBats}
        hit={store.hit}
        twoBaseHit={store.twoBaseHit}
        threeBaseHit={store.threeBaseHit}
        homeRun={store.homeRun}
        totalBases={store.totalBases}
        runsBattedIn={store.runsBattedIn}
        run={store.run}
        strikeOut={store.strikeOut}
        baseOnBalls={store.baseOnBalls}
        hitByPitch={store.hitByPitch}
        sacrificeHit={store.sacrificeHit}
        sacrificeFly={store.sacrificeFly}
        stealingBase={store.stealingBase}
        caughtStealing={store.caughtStealing}
        battingError={store.battingError}
        isSubmitting={submitStep2.isPending}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onSkipPitching={handleSkipPitching}
      />
    </View>
  );
}
