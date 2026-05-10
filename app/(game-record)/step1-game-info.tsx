import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { GameInfoForm } from "@components/game-record/GameInfoForm";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { useGameRecord } from "@hooks/useGameRecord";
import { useProfile } from "@hooks/useProfile";
import { useMySeasons } from "@hooks/useSeasons";
import { getMatchResultFormDefaults } from "@services/matchResultService";
import { useGameRecordStore } from "../../stores/gameRecordStore";

export default function Step1GameInfoScreen() {
  const router = useRouter();
  const {
    createGameResultMutation,
    submitStep1,
    teamsQuery,
    positionsQuery,
    tournamentsQuery,
  } = useGameRecord();
  const store = useGameRecordStore();
  const { profile } = useProfile();
  const { seasons } = useMySeasons();
  const [errors, setErrors] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);

  // 新規作成時にプロフィールのチームを自動セット
  useEffect(() => {
    const state = useGameRecordStore.getState();
    if (
      !state.isEditMode &&
      !state.myTeamId &&
      profile?.team_id &&
      teamsQuery.data
    ) {
      const team = teamsQuery.data.find((t) => t.id === profile.team_id);
      if (team) {
        useGameRecordStore.getState().setField("myTeamId", team.id);
        useGameRecordStore.getState().setField("myTeamName", team.name);
      }
    }
  }, [profile, teamsQuery.data]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const state = useGameRecordStore.getState();
    // 編集モードでないのに前回のデータが残っている場合はリセットして新規作成
    if (state.gameResultId && !state.isEditMode) {
      store.reset();
    }

    if (!useGameRecordStore.getState().isEditMode) {
      setIsInitializing(true);
      createGameResultMutation.mutate(undefined, {
        onSuccess: (data) => {
          useGameRecordStore.getState().setField("gameResultId", data.id);
          useGameRecordStore.getState().setField("userId", data.user_id);
        },
        onSettled: () => setIsInitializing(false),
      });
      // 新規作成時、直近試合のイニング制を初期値として読み込む（履歴なしは 9）
      getMatchResultFormDefaults()
        .then((defaults) => {
          if (typeof defaults?.inning_format === "number") {
            useGameRecordStore
              .getState()
              .setField("inningFormat", defaults.inning_format);
          }
        })
        .catch(() => {
          // 取得失敗時は初期値 9 のまま
        });
    }
  }, [createGameResultMutation]);

  const handleFieldChange = (field: string, value: string | number | null) => {
    store.setField(field as keyof typeof store, value as never);
  };

  const handleSubmit = () => {
    if (submitStep1.isPending) return;

    setErrors([]);
    const validationErrors: string[] = [];

    if (!store.date) validationErrors.push("試合日を入力してください");
    if (!store.myTeamName)
      validationErrors.push("自チーム名を入力してください");
    if (!store.opponentTeamName)
      validationErrors.push("相手チーム名を入力してください");
    // 先発／途中出場のときだけ打順・守備位置を必須にする。
    // 代打／代走／未出場は GameInfoForm 側で自動的に「なし」がセットされるため任意。
    const lineupRequired =
      store.appearanceType === "starter" ||
      store.appearanceType === "substitute";
    if (lineupRequired && !store.battingOrder)
      validationErrors.push("打順を選択してください");
    if (lineupRequired && !store.defensivePosition)
      validationErrors.push("守備位置を選択してください");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitStep1.mutate(undefined, {
      onSuccess: () => {
        // 未出場の場合は打撃・投手成績の入力を飛ばして直接サマリー画面へ。
        const next =
          store.appearanceType === "no_play"
            ? "/(game-record)/summary"
            : "/(game-record)/step2-batting";
        router.push(next);
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2E2E2E" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
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
        tournamentName={store.tournamentName}
        tournamentId={store.tournamentId}
        tournaments={tournamentsQuery.data ?? []}
        seasonId={store.seasonId}
        seasons={seasons}
        teams={teamsQuery.data ?? []}
        positions={positionsQuery.data ?? []}
        inningFormat={store.inningFormat}
        appearanceType={store.appearanceType}
        isSubmitting={submitStep1.isPending}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
