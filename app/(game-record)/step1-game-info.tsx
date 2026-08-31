import type { RecordPattern, Team } from "../../types/gameRecord";
import type { GameInfoFieldErrors } from "@components/game-record/GameInfoForm";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useCreateStadium, useStadiumSearch } from "@hooks/useStadiums";
import { useTeamName, useTeamSearch } from "@hooks/useTeamSearch";
import { getMatchResultFormDefaults } from "@services/matchResultService";
import { trackGameRecordStepViewed } from "@utils/analytics";
import { serverErrorMessage } from "@utils/axiosError";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { useSnackbarStore } from "../../stores/snackbarStore";

export default function Step1GameInfoScreen() {
  const router = useRouter();
  const {
    createGameResultMutation,
    submitStep1,
    positionsQuery,
    tournamentsQuery,
  } = useGameRecord();
  const store = useGameRecordStore();
  const { profile } = useProfile();
  const { seasons } = useMySeasons();
  const { stadiums } = useStadiumSearch(store.stadiumName);
  // teams は全件先読みせず、各チーム名入力に連動した部分取得に分ける
  const { teams: myTeamCandidates } = useTeamSearch(store.myTeamName);
  const { teams: opponentTeamCandidates } = useTeamSearch(store.opponentTeamName);
  const { teamName: profileTeamName } = useTeamName(profile?.team_id);
  // GameInfoForm は自チーム・相手チームで同じ候補リストを受け取るため、両検索結果を統合する
  const teamCandidates = useMemo(() => {
    const byId = new Map<number, Team>();
    for (const team of [...myTeamCandidates, ...opponentTeamCandidates]) {
      byId.set(team.id, team);
    }
    return [...byId.values()];
  }, [myTeamCandidates, opponentTeamCandidates]);
  const { createStadium } = useCreateStadium();
  const [fieldErrors, setFieldErrors] = useState<GameInfoFieldErrors>({});
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);
  // isPending はレンダー時にキャプチャした値のため、mutate() 直後の再レンダー前や
  // 球場作成の await 中の連打を止められない。同期的に読める ref で二重送信を塞ぐ。
  const isSubmittingRef = useRef(false);
  // ref は同期的なガード、state はボタンの disabled 表示用。片方だけ戻し忘れないよう
  // 必ず updateSubmitting 経由で更新する。
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    trackGameRecordStepViewed(1);
  }, []);

  // 新規作成時にプロフィールのチームを自動セット
  useEffect(() => {
    const state = useGameRecordStore.getState();
    if (
      !state.isEditMode &&
      !state.myTeamId &&
      profile?.team_id &&
      profileTeamName
    ) {
      useGameRecordStore.getState().setField("myTeamId", profile.team_id);
      useGameRecordStore.getState().setField("myTeamName", profileTeamName);
    }
  }, [profile, profileTeamName]);

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

  // 編集モードと未出場 (no_play) は「次へ」ボタン経由の固定遷移、
  // 新規作成時は GameInfoForm 下部の PatternSelector からパターンを選んで遷移する。
  const updateSubmitting = (value: boolean) => {
    isSubmittingRef.current = value;
    setIsSubmitting(value);
  };

  const runSubmit = async (
    pattern: RecordPattern | null,
    options?: { completeEdit?: boolean },
  ) => {
    if (isSubmittingRef.current || submitStep1.isPending) return;
    updateSubmitting(true);

    const errors: GameInfoFieldErrors = {};
    if (!store.date) errors.date = "試合日を入力してください";
    if (!store.myTeamName.trim())
      errors.myTeamName = "自チーム名を入力してください";
    if (!store.opponentTeamName.trim())
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
      updateSubmitting(false);
      return;
    }

    setFieldErrors({});
    if (pattern) {
      store.setField("recordPattern", pattern);
    }

    // 球場名が入っているのに stadium_id 未解決なら、submit 前に ID を確定させる。
    // 候補から選ばず打ち切った場合に備え、まず同名の既存球場を探してから新規作成に回す。
    const trimmedStadiumName = store.stadiumName.trim();
    if (trimmedStadiumName && store.stadiumId === null) {
      const existingStadium = stadiums.find(
        (stadium) => stadium.name === trimmedStadiumName,
      );
      try {
        const stadium =
          existingStadium ??
          (await createStadium({ name: trimmedStadiumName }));
        store.setField("stadiumId", stadium.id);
      } catch {
        // 新規作成に失敗しても遷移はブロックしない。stadium_id 未解決のまま送信する。
        useSnackbarStore.getState().show({
          type: "error",
          message: "球場の新規登録に失敗しました。球場なしで保存します。",
        });
      }
    }

    submitStep1.mutate(undefined, {
      onSuccess: () => {
        if (options?.completeEdit) {
          router.replace("/(game-record)/summary");
          return;
        }
        const next = (() => {
          if (store.appearanceType === "no_play")
            return "/(game-record)/summary";
          if (pattern === "pitching") return "/(game-record)/step3-pitching";
          if (pattern === "batting" || pattern === "both")
            return "/(game-record)/plate-appearances";
          // 編集モード（pattern=null）も新仕様の打席リスト画面へ統一する。
          // 旧 BattingForm (step2-batting) は新規記録フローで pattern 未確定時のみ使う。
          if (store.isEditMode) return "/(game-record)/plate-appearances";
          return "/(game-record)/step2-batting";
        })();
        router.push(next);
      },
      onError: (error) => {
        const serverMessage = serverErrorMessage(error);
        useSnackbarStore.getState().show({
          type: "error",
          message:
            serverMessage ||
            (error instanceof Error ? error.message : "エラーが発生しました"),
          durationMs: serverMessage ? 5000 : undefined,
        });
      },
      onSettled: () => {
        updateSubmitting(false);
      },
    });
  };

  // no_play / 編集モードでは GameInfoForm 下部に従来の Button が出る。
  const handleSubmit = () => runSubmit(null);
  const handlePatternSelect = (pattern: RecordPattern) => runSubmit(pattern);
  // 編集モードのみ: 試合情報だけ編集して完了したいケース用の動線。
  const handleCompleteEdit = () => runSubmit(null, { completeEdit: true });

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
        seasonId={store.seasonId}
        stadiums={stadiums}
        seasons={seasons}
        teams={teamCandidates}
        positions={positionsQuery.data ?? []}
        inningFormat={store.inningFormat}
        appearanceType={store.appearanceType}
        stadiumId={store.stadiumId}
        stadiumName={store.stadiumName}
        isSubmitting={isSubmitting || submitStep1.isPending}
        fieldErrors={fieldErrors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onPatternSelect={store.isEditMode ? undefined : handlePatternSelect}
        isEditMode={store.isEditMode}
        onCompleteEdit={store.isEditMode ? handleCompleteEdit : undefined}
      />
    </KeyboardAvoidingView>
  );
}
