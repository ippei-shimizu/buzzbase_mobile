import type { ThrowHand } from "../../../types/pitcher";
import type { BattingSide } from "@constants/handedness";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ProfileEditForm } from "@components/profile/ProfileEditForm";
import { useUserAwards, useAwardMutations } from "@hooks/useAwards";
import { usePrefectures, useBaseballCategories } from "@hooks/useMasterData";
import { useMyTeam } from "@hooks/useMyTeam";
import { usePositions, useUpdateUserPositions } from "@hooks/usePositions";
import { useProfile } from "@hooks/useProfile";
import { useProfileEdit } from "@hooks/useProfileEdit";
import { useTeamSearch } from "@hooks/useTeamSearch";
import {
  searchTeams,
  TEAM_SEARCH_MAX_LIMIT,
} from "@services/gameRecordService";
import { createTeam, updateTeam } from "@services/teamService";

interface AwardItem {
  id?: number;
  title: string;
}

interface TeamPayload {
  name: string;
  category_id: number;
  prefecture_id: number;
}

/**
 * 候補から選ばず打ち切ったチーム名について、完全一致する既存チームの id を返す。
 *
 * @returns 既存チームの id。無ければ null（新規作成に回す）
 */
const findExistingTeamId = async (
  teamPayload: TeamPayload,
): Promise<number | null> => {
  const candidates = await searchTeams(teamPayload.name, TEAM_SEARCH_MAX_LIMIT);
  const sameNameTeams = candidates.filter(
    (team) => team.name === teamPayload.name,
  );
  // 同名チームが複数あるときは、カテゴリ・地域まで一致するものを優先して別チームの属性を上書きしない。
  const sameAttributesTeam = sameNameTeams.find(
    (team) =>
      team.category_id === teamPayload.category_id &&
      team.prefecture_id === teamPayload.prefecture_id,
  );
  return (sameAttributesTeam ?? sameNameTeams[0])?.id ?? null;
};

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const { updateProfile, isUpdating } = useProfileEdit();
  // マスターデータ
  const { data: prefectures } = usePrefectures();
  const { data: categories } = useBaseballCategories();
  const { data: allPositions } = usePositions();
  const { data: existingAwards } = useUserAwards(profile?.id);
  const { mutateAsync: updatePositions } = useUpdateUserPositions();
  const awardMutations = useAwardMutations();

  // フォーム状態
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  // ポジション
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);

  // 利き腕・打席
  const [throwHand, setThrowHand] = useState<ThrowHand | null>(null);
  const [battingSide, setBattingSide] = useState<BattingSide | null>(null);

  // チーム
  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedPrefectureId, setSelectedPrefectureId] = useState<
    number | null
  >(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const hasRestoredTeamRef = useRef(false);
  const { teams: teamSuggestions } = useTeamSearch(teamSearchQuery);
  const {
    teamName: profileTeamName,
    categoryName: profileTeamCategoryName,
    prefectureName: profileTeamPrefectureName,
  } = useMyTeam(profile?.team_id ? profile.user_id : null);

  // 受賞歴
  const [awards, setAwards] = useState<AwardItem[]>([]);

  // プロフィール初期化
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUserId(profile.user_id ?? "");
      setIntroduction(profile.introduction ?? "");
      setIsPrivate(profile.is_private);
      setImageUri(profile.image?.url ?? null);
      setSelectedPositionIds(profile.positions?.map((p) => p.id) ?? []);
      setThrowHand(profile.throw_hand ?? null);
      setBattingSide(profile.batting_side ?? null);
    }
  }, [profile]);

  // 所属チームはサーバー側で名前解決済みの値を使い、カテゴリ・地域は名前からマスタの id に引き当てる。
  // 復元は1度だけ行い、再取得でユーザーの編集を上書きしない。
  useEffect(() => {
    if (hasRestoredTeamRef.current || !profile?.team_id || !profileTeamName) {
      return;
    }
    if (profileTeamCategoryName && !categories) return;
    if (profileTeamPrefectureName && !prefectures) return;
    hasRestoredTeamRef.current = true;
    setSelectedTeamId(profile.team_id);
    setTeamName(profileTeamName);
    setSelectedCategoryId(
      categories?.find((category) => category.name === profileTeamCategoryName)
        ?.id ?? null,
    );
    setSelectedPrefectureId(
      prefectures?.find(
        (prefecture) => prefecture.name === profileTeamPrefectureName,
      )?.id ?? null,
    );
  }, [
    profile?.team_id,
    profileTeamName,
    profileTeamCategoryName,
    profileTeamPrefectureName,
    categories,
    prefectures,
  ]);

  // 受賞歴初期化
  useEffect(() => {
    if (existingAwards) {
      setAwards(existingAwards.map((a) => ({ id: a.id, title: a.title })));
    }
  }, [existingAwards]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  // チーム選択ハンドラ
  const handleSelectTeam = (id: number, teamLabel: string) => {
    const team = teamSuggestions.find((suggestion) => suggestion.id === id);
    setSelectedTeamId(id);
    setTeamName(teamLabel);
    if (team) {
      setSelectedCategoryId(team.category_id);
      setSelectedPrefectureId(team.prefecture_id);
    }
  };

  // 同名チームが存在しうるため、名前が変わらない限り確定済みの id を保つ。
  const handleCustomTeamInput = (text: string) => {
    if (text.trim() !== teamName.trim()) setSelectedTeamId(null);
    setTeamName(text);
  };

  // 受賞歴ハンドラ
  const handleChangeAward = (index: number, title: string) => {
    setAwards((prev) =>
      prev.map((a, i) => (i === index ? { ...a, title } : a)),
    );
  };

  const handleRemoveAward = (index: number) => {
    setAwards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAward = () => {
    setAwards((prev) => [...prev, { title: "" }]);
  };

  const handleSave = async () => {
    if (!profile) return;

    // user_idバリデーション
    const userIdPattern = /^[A-Za-z0-9_-]+$/;
    if (
      userId &&
      (!userIdPattern.test(userId) || userId.length < 3 || userId.length > 30)
    ) {
      Alert.alert(
        "入力エラー",
        "ユーザーIDは半角英数字、ハイフン(-)、アンダーバー(_)のみ、3〜30文字で入力してください",
      );
      return;
    }

    // チーム入力バリデーション: チーム名が入力されている場合はカテゴリーと都道府県の両方が必須
    const trimmedTeamName = teamName.trim();
    if (trimmedTeamName && (!selectedCategoryId || !selectedPrefectureId)) {
      Alert.alert(
        "入力エラー",
        "チーム名を入力した場合は、所属カテゴリーと所属地域の両方を選択してください",
      );
      return;
    }

    try {
      // 1. プロフィール基本情報更新
      const formData = new FormData();
      formData.append("user[name]", name);
      formData.append("user[user_id]", userId);
      formData.append("user[introduction]", introduction);
      formData.append("user[is_private]", String(isPrivate));
      // 未選択に戻したときは空文字を送り、サーバー側で nil に正規化される。
      formData.append("user[throw_hand]", throwHand ?? "");
      formData.append("user[batting_side]", battingSide ?? "");

      if (imageChanged && imageUri) {
        const filename = imageUri.split("/").pop() ?? "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("user[image]", {
          uri: imageUri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      // チーム処理（バリデーション済みなのでカテゴリー・都道府県は必ず選択されている）
      if (trimmedTeamName) {
        const teamPayload: TeamPayload = {
          name: trimmedTeamName,
          category_id: selectedCategoryId as number,
          prefecture_id: selectedPrefectureId as number,
        };
        let teamId = selectedTeamId ?? (await findExistingTeamId(teamPayload));
        if (!teamId) {
          const newTeam = await createTeam(teamPayload);
          teamId = newTeam.id;
        } else {
          await updateTeam(teamId, teamPayload);
        }
        formData.append("user[team_id]", String(teamId));
      } else {
        formData.append("user[team_id]", "");
      }

      await updateProfile(formData);

      // 2. ポジション更新
      await updatePositions({
        userId: profile.id,
        positionIds: selectedPositionIds,
      });

      // 3. 受賞歴の差分更新
      const existingIds = new Set(existingAwards?.map((a) => a.id) ?? []);
      const currentIds = new Set(awards.filter((a) => a.id).map((a) => a.id!));

      // 削除
      for (const existing of existingAwards ?? []) {
        if (!currentIds.has(existing.id)) {
          await awardMutations.remove.mutateAsync({
            userId: profile.id,
            awardId: existing.id,
          });
        }
      }

      // 新規作成・更新
      for (const award of awards) {
        if (!award.title.trim()) continue;
        if (award.id && existingIds.has(award.id)) {
          const original = existingAwards?.find((a) => a.id === award.id);
          if (original && original.title !== award.title) {
            await awardMutations.update.mutateAsync({
              userId: profile.id,
              awardId: award.id,
              title: award.title,
            });
          }
        } else if (!award.id) {
          await awardMutations.create.mutateAsync({
            userId: profile.id,
            title: award.title,
          });
        }
      }

      router.back();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "errors" in error.response.data
      ) {
        const axiosError = error as {
          response: { data: { errors: string[] } };
        };
        Alert.alert("エラー", axiosError.response.data.errors.join("\n"));
      } else {
        Alert.alert("エラー", "プロフィールの更新に失敗しました");
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  // ピッカー用のアイテム変換
  const positionItems =
    allPositions?.map((p) => ({ label: p.name, value: p.id })) ?? [];
  const teamItems = teamSuggestions.map((team) => ({
    label: team.name,
    value: team.id,
  }));
  const categoryItems =
    categories?.map((c) => ({ label: c.name, value: c.id })) ?? [];
  const prefectureItems =
    prefectures?.map((p) => ({ label: p.name, value: p.id })) ?? [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <ProfileEditForm
          name={name}
          userId={userId}
          introduction={introduction}
          isPrivate={isPrivate}
          imageUri={imageUri}
          isUpdating={isUpdating}
          onChangeName={setName}
          onChangeUserId={setUserId}
          onChangeIntroduction={setIntroduction}
          onChangeIsPrivate={setIsPrivate}
          onPickImage={handlePickImage}
          onSave={handleSave}
          // ポジション
          selectedPositionIds={selectedPositionIds}
          positionItems={positionItems}
          onSelectPositions={setSelectedPositionIds}
          // 利き腕・打席
          throwHand={throwHand}
          battingSide={battingSide}
          onChangeThrowHand={setThrowHand}
          onChangeBattingSide={setBattingSide}
          // チーム
          teamName={teamName}
          selectedTeamId={selectedTeamId}
          selectedCategoryId={selectedCategoryId}
          selectedPrefectureId={selectedPrefectureId}
          teamItems={teamItems}
          categoryItems={categoryItems}
          prefectureItems={prefectureItems}
          onSelectTeam={handleSelectTeam}
          onCustomTeamInput={handleCustomTeamInput}
          onSearchTeam={setTeamSearchQuery}
          onSelectCategory={(v) =>
            setSelectedCategoryId(typeof v === "number" ? v : null)
          }
          onSelectPrefecture={(v) =>
            setSelectedPrefectureId(typeof v === "number" ? v : null)
          }
          // 受賞歴
          awards={awards}
          onChangeAward={handleChangeAward}
          onRemoveAward={handleRemoveAward}
          onAddAward={handleAddAward}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});
