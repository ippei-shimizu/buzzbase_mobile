import type { ThrowHand } from "../../types/pitcher";
import type { TeamDetail } from "../../types/profile";
import type { BattingSide } from "@constants/handedness";
import * as Sentry from "@sentry/react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileSetupForm } from "@components/auth/ProfileSetupForm";
import { usePositions } from "@hooks/usePositions";
import { useProfile } from "@hooks/useProfile";
import { updateUserPositions } from "@services/positionService";
import { updateUserProfile } from "@services/profileService";
import { createTeam, searchTeams } from "@services/teamService";
import { useSnackbarStore } from "@stores/snackbarStore";

/**
 * ユーザー名登録の直後に挟む任意のプロフィール入力。
 * 所属チームとポジションは試合記録フォームの初期値に使われるため、ここで埋めておくと
 * 初回の記録で入力が必要なのは相手チーム名だけになる。すべて任意でスキップできる。
 */
export default function ProfileSetupScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { data: positions } = usePositions();

  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [throwHand, setThrowHand] = useState<ThrowHand | null>(null);
  const [battingSide, setBattingSide] = useState<BattingSide | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLeavingRef = useRef(false);

  const trimmedTeamName = teamName.trim();

  const { data: teamSuggestions } = useQuery({
    queryKey: ["teams", "search", trimmedTeamName],
    queryFn: () => searchTeams(trimmedTeamName),
    enabled: trimmedTeamName.length > 0,
  });

  // 候補と完全一致している間は選択済みの id を維持する。名前だけで引き直すと
  // 同名チームが複数あるときに別のチームの id を掴む。
  const visibleSuggestions = (teamSuggestions ?? []).filter(
    (team) => team.name !== trimmedTeamName,
  );

  const leave = () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    router.replace("/(tabs)");
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
    if (value.trim() !== trimmedTeamName) setSelectedTeamId(null);
  };

  const handleTeamSuggestionSelect = (team: TeamDetail) => {
    setTeamName(team.name);
    setSelectedTeamId(team.id);
  };

  /**
   * 候補から選んでいればその id を使う。選ばず打ち切った場合は同名チームを
   * サーバー側で引き当てさせ、無ければ新規作成する（試合記録の球場欄と同じ方針）。
   */
  const resolveTeamId = async (): Promise<number | null> => {
    if (!trimmedTeamName) return null;
    if (selectedTeamId !== null) return selectedTeamId;
    const team = await createTeam({ name: trimmedTeamName });
    return team.id;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
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

      if (profile?.id) {
        await updateUserPositions(profile.id, selectedPositionIds);
      }

      leave();
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
          teamSuggestions={visibleSuggestions}
          positions={positions ?? []}
          selectedPositionIds={selectedPositionIds}
          throwHand={throwHand}
          battingSide={battingSide}
          errors={errors}
          isSubmitting={isSubmitting}
          onTeamNameChange={handleTeamNameChange}
          onTeamSuggestionSelect={handleTeamSuggestionSelect}
          onPositionsChange={setSelectedPositionIds}
          onThrowHandChange={setThrowHand}
          onBattingSideChange={setBattingSide}
          onSubmit={handleSubmit}
          onSkip={leave}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
