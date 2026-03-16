import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useGameRecord } from "@hooks/useGameRecord";
import { useMySeasons } from "@hooks/useSeasons";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { GameInfoForm } from "@components/game-record/GameInfoForm";

export default function Step1GameInfoScreen() {
  const router = useRouter();
  const { createGameResultMutation, submitStep1, teamsQuery, positionsQuery } =
    useGameRecord();
  const store = useGameRecordStore();
  const { seasons } = useMySeasons();
  const [errors, setErrors] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const gameResultId = useGameRecordStore.getState().gameResultId;
    if (!gameResultId && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsInitializing(true);
      createGameResultMutation.mutate(undefined, {
        onSuccess: (data) => {
          useGameRecordStore.getState().setField("gameResultId", data.id);
          useGameRecordStore.getState().setField("userId", data.user_id);
        },
        onSettled: () => setIsInitializing(false),
      });
    }
  }, [createGameResultMutation]);

  const handleFieldChange = (field: string, value: string | number | null) => {
    store.setField(field as keyof typeof store, value as never);
  };

  const handleSubmit = () => {
    setErrors([]);
    const validationErrors: string[] = [];

    if (!store.date) validationErrors.push("試合日を入力してください");
    if (!store.myTeamName)
      validationErrors.push("自チーム名を入力してください");
    if (!store.opponentTeamName)
      validationErrors.push("相手チーム名を入力してください");
    if (!store.defensivePosition)
      validationErrors.push("守備位置を選択してください");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitStep1.mutate(undefined, {
      onSuccess: () => {
        router.push("/(game-record)/step2-batting");
      },
      onError: (error) => {
        setErrors([
          error instanceof Error ? error.message : "エラーが発生しました",
        ]);
      },
    });
  };

  if (isInitializing || createGameResultMutation.isPending) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2E2E2E",
        }}
      >
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <StepIndicator currentStep={1} />
      <GameInfoForm
        date={store.date}
        matchType={store.matchType}
        myTeamName={store.myTeamName}
        myTeamId={store.myTeamId}
        opponentTeamName={store.opponentTeamName}
        opponentTeamId={store.opponentTeamId}
        myTeamScore={store.myTeamScore}
        opponentTeamScore={store.opponentTeamScore}
        battingOrder={store.battingOrder}
        defensivePosition={store.defensivePosition}
        memo={store.memo}
        seasonId={store.seasonId}
        seasons={seasons}
        teams={teamsQuery.data ?? []}
        positions={positionsQuery.data ?? []}
        isSubmitting={submitStep1.isPending}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
