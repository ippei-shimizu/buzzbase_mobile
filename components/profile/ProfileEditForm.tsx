import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";
import { AwardSection } from "./AwardSection";
import { PositionSection } from "./PositionSection";
import { TeamSection } from "./TeamSection";

interface AwardItem {
  id?: number;
  title: string;
}

interface ProfileEditFormProps {
  name: string;
  userId: string;
  introduction: string;
  isPrivate: boolean;
  imageUri: string | null;
  isUpdating: boolean;
  onChangeName: (value: string) => void;
  onChangeUserId: (value: string) => void;
  onChangeIntroduction: (value: string) => void;
  onChangeIsPrivate: (value: boolean) => void;
  onPickImage: () => void;
  onSave: () => void;
  // ポジション
  selectedPositionIds: number[];
  positionItems: { label: string; value: number }[];
  onSelectPositions: (values: number[]) => void;
  // チーム
  teamName: string;
  selectedTeamId: number | null;
  selectedCategoryId: number | null;
  selectedPrefectureId: number | null;
  teamItems: { label: string; value: number }[];
  categoryItems: { label: string; value: number }[];
  prefectureItems: { label: string; value: number }[];
  onSelectTeam: (id: number, name: string) => void;
  onCustomTeamInput: (name: string) => void;
  onSelectCategory: (value: string | number) => void;
  onSelectPrefecture: (value: string | number) => void;
  // 受賞歴
  awards: AwardItem[];
  onChangeAward: (index: number, title: string) => void;
  onRemoveAward: (index: number) => void;
  onAddAward: () => void;
}

export const ProfileEditForm = ({
  name,
  userId,
  introduction,
  isPrivate,
  imageUri,
  isUpdating,
  onChangeName,
  onChangeUserId,
  onChangeIntroduction,
  onChangeIsPrivate,
  onPickImage,
  onSave,
  selectedPositionIds,
  positionItems,
  onSelectPositions,
  teamName,
  selectedTeamId,
  selectedCategoryId,
  selectedPrefectureId,
  teamItems,
  categoryItems,
  prefectureItems,
  onSelectTeam,
  onCustomTeamInput,
  onSelectCategory,
  onSelectPrefecture,
  awards,
  onChangeAward,
  onRemoveAward,
  onAddAward,
}: ProfileEditFormProps) => {
  const hasValidImage =
    imageUri && !imageUri.endsWith(".svg") && imageUri.length > 0;
  const imageSource = hasValidImage
    ? {
        uri:
          imageUri.startsWith("http") || imageUri.startsWith("file://")
            ? imageUri
            : `${API_BASE_URL}${imageUri}`,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* プロフィール画像 */}
      <TouchableOpacity style={styles.avatarContainer} onPress={onPickImage}>
        {imageSource ? (
          <Image source={imageSource} style={styles.avatar} />
        ) : (
          <DefaultUserIcon size={80} />
        )}
        <Text style={styles.changePhotoText}>画像を編集</Text>
      </TouchableOpacity>

      {/* 非公開設定 */}
      <View style={styles.switchRow}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>非公開アカウント</Text>
          <Text style={styles.switchDescription}>
            承認したフォロワーのみが成績やプロフィールを閲覧できます
          </Text>
        </View>
        <Switch
          style={styles.switchSmall}
          value={isPrivate}
          onValueChange={onChangeIsPrivate}
          trackColor={{ false: "#525252", true: "#d08000" }}
          thumbColor="#F4F4F4"
        />
      </View>

      {/* 名前 */}
      <View style={styles.field}>
        <Text style={styles.label}>
          名前<Text style={styles.required}> *</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder="名前を入力"
          placeholderTextColor="#71717A"
        />
      </View>

      {/* ユーザーID */}
      <View style={styles.field}>
        <Text style={styles.label}>ユーザーID</Text>
        <View style={styles.userIdRow}>
          <Text style={styles.atMark}>@</Text>
          <TextInput
            style={[styles.input, styles.userIdInput]}
            value={userId}
            onChangeText={onChangeUserId}
            placeholder="buzz_base235"
            placeholderTextColor="#71717A"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
        </View>
        <Text style={styles.userIdHint}>
          半角英数字、ハイフン(-)、アンダーバー(_)のみ、3〜30文字
        </Text>
      </View>

      {/* 自己紹介 */}
      <View style={styles.field}>
        <Text style={styles.label}>自己紹介</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={introduction}
          onChangeText={onChangeIntroduction}
          placeholder="自己紹介を入力（100文字以内）"
          placeholderTextColor="#71717A"
          multiline
          maxLength={100}
        />
      </View>

      {/* ポジション */}
      <PositionSection
        selectedPositionIds={selectedPositionIds}
        positions={positionItems}
        onSelect={onSelectPositions}
      />

      {/* チーム設定 */}
      <TeamSection
        teamName={teamName}
        selectedTeamId={selectedTeamId}
        selectedCategoryId={selectedCategoryId}
        selectedPrefectureId={selectedPrefectureId}
        teams={teamItems}
        categories={categoryItems}
        prefectures={prefectureItems}
        onSelectTeam={onSelectTeam}
        onCustomTeamInput={onCustomTeamInput}
        onSelectCategory={onSelectCategory}
        onSelectPrefecture={onSelectPrefecture}
      />

      {/* 受賞歴 */}
      <AwardSection
        awards={awards}
        onChangeAward={onChangeAward}
        onRemoveAward={onRemoveAward}
        onAddAward={onAddAward}
      />

      {/* 保存ボタン */}
      <TouchableOpacity
        style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>保存</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchSmall: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  switchLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  switchDescription: {
    color: "#71717A",
    fontSize: 12,
    marginTop: 2,
    maxWidth: 260,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoText: {
    color: "#d08000",
    fontSize: 14,
    marginTop: 8,
  },
  field: {},
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#52525B",
    paddingVertical: 10,
    paddingHorizontal: 4,
    color: "#F4F4F4",
    fontSize: 16,
  },
  userIdRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  atMark: {
    color: "#d08000",
    fontSize: 16,
    marginRight: 4,
    paddingVertical: 10,
  },
  userIdInput: {
    flex: 1,
  },
  userIdHint: {
    color: "#71717A",
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
