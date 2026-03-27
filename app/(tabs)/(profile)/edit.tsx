import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "@hooks/useProfile";
import { useProfileEdit } from "@hooks/useProfileEdit";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { usePositions, useUpdateUserPositions } from "@hooks/usePositions";
import { useUserAwards, useAwardMutations } from "@hooks/useAwards";
import { createTeam, updateTeam } from "@services/teamService";
import { ProfileEditForm } from "@components/profile/ProfileEditForm";

interface AwardItem {
  id?: number;
  title: string;
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const { updateProfile, isUpdating } = useProfileEdit();
  // マスターデータ
  const { data: allTeams } = useTeams();
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

  // チーム
  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedPrefectureId, setSelectedPrefectureId] = useState<
    number | null
  >(null);

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

      if (profile.team_id && allTeams) {
        const team = allTeams.find((t) => t.id === profile.team_id);
        if (team) {
          setSelectedTeamId(team.id);
          setTeamName(team.name);
          setSelectedCategoryId(team.category_id);
          setSelectedPrefectureId(team.prefecture_id);
        }
      }
    }
  }, [profile, allTeams]);

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
    const team = allTeams?.find((t) => t.id === id);
    setSelectedTeamId(id);
    setTeamName(teamLabel);
    if (team) {
      setSelectedCategoryId(team.category_id);
      setSelectedPrefectureId(team.prefecture_id);
    }
  };

  const handleCustomTeamInput = (text: string) => {
    setTeamName(text);
    setSelectedTeamId(null);
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

    try {
      // 1. プロフィール基本情報更新
      const formData = new FormData();
      formData.append("user[name]", name);
      formData.append("user[user_id]", userId);
      formData.append("user[introduction]", introduction);
      formData.append("user[is_private]", String(isPrivate));

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

      // チーム処理
      if (teamName.trim()) {
        let teamId = selectedTeamId;
        if (!teamId) {
          // 新規チーム作成
          const newTeam = await createTeam({
            name: teamName.trim(),
            category_id: selectedCategoryId ?? 0,
            prefecture_id: selectedPrefectureId ?? 0,
          });
          teamId = newTeam.id;
        } else {
          // 既存チーム更新
          await updateTeam(teamId, {
            name: teamName.trim(),
            category_id: selectedCategoryId ?? undefined,
            prefecture_id: selectedPrefectureId ?? undefined,
          });
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
    } catch {
      Alert.alert("エラー", "プロフィールの更新に失敗しました");
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
  const teamItems =
    allTeams?.map((t) => ({ label: t.name, value: t.id })) ?? [];
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
          onSelectCategory={(v) => setSelectedCategoryId(v as number)}
          onSelectPrefecture={(v) => setSelectedPrefectureId(v as number)}
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
