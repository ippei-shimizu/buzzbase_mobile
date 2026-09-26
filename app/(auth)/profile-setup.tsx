import type { Team } from "../../types/gameRecord";
import type { ThrowHand } from "../../types/pitcher";
import type { BattingSide } from "@constants/handedness";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BackHandler, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileSetupForm } from "@components/auth/ProfileSetupForm";
import { usePositions } from "@hooks/usePositions";
import { useProfile } from "@hooks/useProfile";
import { useTeamName, useTeamSearch } from "@hooks/useTeamSearch";
import {
  createTeam,
  searchTeams,
  TEAM_SEARCH_MAX_LIMIT,
} from "@services/gameRecordService";
import { updateUserPositions } from "@services/positionService";
import { updateUserProfile } from "@services/profileService";
import { useSnackbarStore } from "@stores/snackbarStore";
import {
  trackProfileSetupCompleted,
  trackProfileSetupViewed,
} from "@utils/analytics";

/**
 * ユーザー名登録の直後に挟む任意のプロフィール入力。
 * 所属チームとポジションは試合記録フォームの初期値に使われるため、ここで埋めておくと
 * 初回の記録で入力が必要なのは相手チーム名だけになる。すべて任意でスキップできる。
 */
export default function ProfileSetupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { data: positions } = usePositions();

  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [throwHand, setThrowHand] = useState<ThrowHand | null>(null);
  const [battingSide, setBattingSide] = useState<BattingSide | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLeavingRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const hasRestoredTeamNameRef = useRef(false);

  const trimmedTeamName = teamName.trim();
  const { teams: teamSuggestions } = useTeamSearch(teamName);
  const { teamName: profileTeamName, isLoading: isProfileTeamNameLoading } =
    useTeamName(profile?.team_id);

  useEffect(() => {
    trackProfileSetupViewed();
  }, []);

  // 既に値を持つユーザーがこの画面に来た場合に、未入力のまま保存して既存値を消さないよう復元する。
  // 復元は1度だけ行い、ユーザーの編集を上書きしない。
  useEffect(() => {
    if (hasRestoredRef.current || profile === undefined) return;
    hasRestoredRef.current = true;
    setSelectedTeamId(profile.team_id);
    setSelectedPositionIds(
      profile.positions?.map((position) => position.id) ?? [],
    );
    setThrowHand(profile.throw_hand);
    setBattingSide(profile.batting_side);
  }, [profile]);

  // チーム名は id とは別クエリで解決するため、届いた時点で入力欄へ反映する。
  // 名前が空のままだと送信時に「未入力」と判定され、既存の所属チームを消してしまう。
  useEffect(() => {
    if (hasRestoredTeamNameRef.current || !profileTeamName) return;
    hasRestoredTeamNameRef.current = true;
    setTeamName(profileTeamName);
  }, [profileTeamName]);

  // 認証は済んでいるので、戻って未完了の登録画面に着地させない。
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, []);

  const leave = (skipped: boolean) => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    trackProfileSetupCompleted({
      skipped,
      has_team: trimmedTeamName.length > 0,
      position_count: selectedPositionIds.length,
    });
    router.replace("/(tabs)");
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    if (value.trim() !== trimmedTeamName) setSelectedTeamId(null);
  };

  const handleTeamSuggestionSelect = (team: Team) => {
    setTeamName(team.name);
    setSelectedTeamId(team.id);
  };

  /**
   * 候補から選んでいればその id を使う。選ばず打ち切った場合は完全一致の既存チームを
   * 探してから新規作成に回す（試合記録の送信処理と同じ方針）。
   */
  const resolveTeamId = async (): Promise<number | null> => {
    if (!trimmedTeamName) return null;
    if (selectedTeamId !== null) return selectedTeamId;
    const candidates = await searchTeams(
      trimmedTeamName,
      TEAM_SEARCH_MAX_LIMIT,
    );
    const existing = candidates.find((team) => team.name === trimmedTeamName);
    const team = existing ?? (await createTeam(trimmedTeamName));
    return team.id;
  };

  const handleSubmit = async () => {
    if (isSubmitting || profile === undefined) return;
    setErrors([]);
    setIsSubmitting(true);

    try {
      const teamId = await resolveTeamId();

      const formData = new FormData();
      // 未選択に戻したときは空文字を送り、サーバー側で nil に正規化される。
      formData.append("user[throw_hand]", throwHand ?? "");
      formData.append("user[batting_side]", battingSide ?? "");
      formData.append("user[team_id]", teamId === null ? "" : String(teamId));
      await updateUserProfile(formData);
      await updateUserPositions(profile.id, selectedPositionIds);

      // ダッシュボードが staleTime 内のキャッシュを読んで「未設定」のまま表示するのを防ぐ。
      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      leave(false);
      useSnackbarStore.getState().show({
        type: "success",
        message: "プロフィールを保存しました",
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "profile_setup" },
      });
      setErrors(["保存に失敗しました。あとからプロフィール編集で設定できます"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#2E2E2E" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ProfileSetupForm
          teamName={teamName}
          teamSuggestions={teamSuggestions}
          positions={positions ?? []}
          selectedPositionIds={selectedPositionIds}
          throwHand={throwHand}
          battingSide={battingSide}
          errors={errors}
          isSubmitting={isSubmitting}
          isSubmitDisabled={
            isProfileLoading ||
            profile === undefined ||
            isProfileTeamNameLoading
          }
          onTeamNameChange={handleTeamNameChange}
          onTeamSuggestionSelect={handleTeamSuggestionSelect}
          onPositionsChange={setSelectedPositionIds}
          onThrowHandChange={setThrowHand}
          onBattingSideChange={setBattingSide}
          onSubmit={handleSubmit}
          onSkip={() => leave(true)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
