import type { GameInfoFieldErrors } from "@components/game-record/GameInfoForm";
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
import { isLineupRequired } from "@constants/appearanceType";
import { useGameRecord } from "@hooks/useGameRecord";
import { useProfile } from "@hooks/useProfile";
import { useMySeasons } from "@hooks/useSeasons";
import { getMatchResultFormDefaults } from "@services/matchResultService";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { useSnackbarStore } from "../../stores/snackbarStore";

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
  const [fieldErrors, setFieldErrors] = useState<GameInfoFieldErrors>({});
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
      // 新規作成時、直近試合のフォーム初期値を読み込む。
      // - inning_format / match_type / batting_order: 直近試合の値
      // - defensive_position: プロフィール優先 → 直近試合フォールバック（サーバー側で解決済み）
      // 履歴なし・未設定で nil が返るフィールドは触らず initialState のままにする。
      getMatchResultFormDefaults()
        .then((defaults) => {
          const s = useGameRecordStore.getState();
          if (typeof defaults.inning_format === "number") {
            s.setField("inningFormat", defaults.inning_format);
          }
          if (defaults.match_type) {
            s.setField("matchType", defaults.match_type);
          }
          if (defaults.defensive_position) {
            s.setField("defensivePosition", defaults.defensive_position);
          }
          if (defaults.batting_order) {
            s.setField("battingOrder", defaults.batting_order);
          }
        })
        .catch(() => {
          // 取得失敗時は initialState のデフォルトのまま
        });
    }
  }, [createGameResultMutation]);

  const handleFieldChange = (field: string, value: string | number | null) => {
    store.setField(field as keyof typeof store, value as never);
    // ユーザーが入力を始めたら該当フィールドのエラーをクリア
    if (field in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof GameInfoFieldErrors];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    if (submitStep1.isPending) return;

    const errors: GameInfoFieldErrors = {};
    if (!store.date) errors.date = "試合日を入力してください";
    if (!store.myTeamName) errors.myTeamName = "自チーム名を入力してください";
    if (!store.opponentTeamName)
      errors.opponentTeamName = "相手チーム名を入力してください";
    // 点数: 0-0（完封試合）も有効値のため、null（未入力）かどうかで判定する。
    if (store.myTeamScore === null) {
      errors.myTeamScore = "自チームの点数を入力してください";
    }
    if (store.opponentTeamScore === null) {
      errors.opponentTeamScore = "相手チームの点数を入力してください";
    }
    // 先発／途中出場のときだけ守備位置を必須にする。
    // 打順は DH 制で投手として出場する場合「なし」を許容するため任意。
    // 代打／代走／未出場は GameInfoForm 側で自動的に「なし」がセットされるため任意。
    const lineupRequired = isLineupRequired(store.appearanceType);
    if (lineupRequired && !store.defensivePosition) {
      errors.defensivePosition = "守備位置を選択してください";
    }

    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      setFieldErrors(errors);
      // バリデーション項目が複数ある場合は改行で連結し、Snackbar に詳細を表示する。
      useSnackbarStore.getState().show({
        type: "error",
        message: errorMessages.join("\n"),
        // 詳細メッセージは長くなりがちなので既定より長めに表示する。
        durationMs: 5000,
      });
      return;
    }

    setFieldErrors({});
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
        useSnackbarStore.getState().show({
          type: "error",
          message:
            error instanceof Error ? error.message : "エラーが発生しました",
        });
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
    // KeyboardAvoidingView でキーボード表示時のボトム余白を確保し、
    // 画面下部のフィールド（点数・打順・守備位置・メモ）が隠れないようにする。
    // ScrollView 内の自動フォーカス追従は行わない（サジェストを見切れさせないため）。
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
        seasonName={store.seasonName}
        seasons={seasons}
        teams={teamsQuery.data ?? []}
        positions={positionsQuery.data ?? []}
        inningFormat={store.inningFormat}
        appearanceType={store.appearanceType}
        isSubmitting={submitStep1.isPending}
        fieldErrors={fieldErrors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
