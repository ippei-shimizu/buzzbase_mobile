import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SearchablePicker } from "@components/ui/SearchablePicker";
import { SelectPicker } from "@components/ui/SelectPicker";

interface Props {
  teamName: string;
  selectedTeamId: number | null;
  selectedCategoryId: number | null;
  selectedPrefectureId: number | null;
  teams: { label: string; value: number }[];
  categories: { label: string; value: number }[];
  prefectures: { label: string; value: number }[];
  onSelectTeam: (id: number, name: string) => void;
  onCustomTeamInput: (name: string) => void;
  onSelectCategory: (value: string | number) => void;
  onSelectPrefecture: (value: string | number) => void;
}

export const TeamSection = ({
  teamName,
  selectedCategoryId,
  selectedPrefectureId,
  teams,
  categories,
  prefectures,
  onSelectTeam,
  onCustomTeamInput,
  onSelectCategory,
  onSelectPrefecture,
}: Props) => {
  const hasTeamName = teamName.trim().length > 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>チーム設定</Text>

      <SearchablePicker
        label="チーム名"
        items={teams}
        value={teamName}
        onSelect={(value, label) => onSelectTeam(value as number, label)}
        onCustomInput={onCustomTeamInput}
        placeholder="チーム名を検索・入力"
      />

      <View style={!hasTeamName ? styles.disabled : undefined}>
        <SelectPicker
          label="所属カテゴリー（年代 / リーグ / 連盟）"
          items={categories}
          selectedValue={selectedCategoryId}
          onSelect={onSelectCategory}
          placeholder="カテゴリを選択"
        />

        <SelectPicker
          label="所属地域（都道府県）"
          items={prefectures}
          selectedValue={selectedPrefectureId}
          onSelect={onSelectPrefecture}
          placeholder="都道府県を選択"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: "none",
  },
});
