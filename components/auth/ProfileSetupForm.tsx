import type { ThrowHand } from "../../types/pitcher";
import type { TeamDetail } from "../../types/profile";
import type { BattingSide } from "@constants/handedness";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { MultiSelectPicker } from "@components/ui/MultiSelectPicker";
import { SelectPicker } from "@components/ui/SelectPicker";
import { TextInput } from "@components/ui/TextInput";
import {
  BATTING_SIDE_LABELS,
  BATTING_SIDES,
  THROW_HANDS,
} from "@constants/handedness";
import { THROW_HAND_FULL_LABELS } from "@constants/throwHand";

interface Position {
  id: number;
  name: string;
}

interface Props {
  teamName: string;
  teamSuggestions: TeamDetail[];
  positions: Position[];
  selectedPositionIds: number[];
  throwHand: ThrowHand | null;
  battingSide: BattingSide | null;
  errors: string[];
  isSubmitting: boolean;
  onTeamNameChange: (value: string) => void;
  onTeamSuggestionSelect: (team: TeamDetail) => void;
  onPositionsChange: (positionIds: number[]) => void;
  onThrowHandChange: (value: ThrowHand | null) => void;
  onBattingSideChange: (value: BattingSide | null) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function ProfileSetupForm({
  teamName,
  teamSuggestions,
  positions,
  selectedPositionIds,
  throwHand,
  battingSide,
  errors,
  isSubmitting,
  onTeamNameChange,
  onTeamSuggestionSelect,
  onPositionsChange,
  onThrowHandChange,
  onBattingSideChange,
  onSubmit,
  onSkip,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>スキップ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>あなたのことを教えてください</Text>
        <Text style={styles.description}>
          登録しておくと、試合の記録を始めるときに自チームや守備位置が自動で入ります。あとから変更できます。
        </Text>

        <ErrorMessage errors={errors} />

        <View style={styles.teamField}>
          <TextInput
            label="所属チーム"
            placeholder="チーム名を入力"
            value={teamName}
            onChangeText={onTeamNameChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {teamSuggestions.length > 0 ? (
            <View style={styles.suggestions}>
              {teamSuggestions.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.suggestionItem}
                  onPress={() => onTeamSuggestionSelect(team)}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <MultiSelectPicker
            label="ポジション"
            items={positions.map((position) => ({
              label: position.name,
              value: position.id,
            }))}
            selectedValues={selectedPositionIds}
            onSelect={onPositionsChange}
          />
        </View>

        <View style={styles.field}>
          <SelectPicker
            label="利き腕"
            items={THROW_HANDS.map((hand) => ({
              label: THROW_HAND_FULL_LABELS[hand],
              value: hand,
            }))}
            selectedValue={throwHand}
            onSelect={(value) => onThrowHandChange(value as ThrowHand | null)}
            showClear
          />
        </View>

        <View style={styles.field}>
          <SelectPicker
            label="打席"
            items={BATTING_SIDES.map((side) => ({
              label: BATTING_SIDE_LABELS[side],
              value: side,
            }))}
            selectedValue={battingSide}
            onSelect={(value) =>
              onBattingSideChange(value as BattingSide | null)
            }
            showClear
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="はじめる" onPress={onSubmit} loading={isSubmitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#A1A1AA",
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  teamField: {
    marginBottom: 8,
  },
  field: {
    marginBottom: 16,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: "#3F3F46",
    borderRadius: 8,
    backgroundColor: "#27272A",
    marginTop: -8,
    marginBottom: 16,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    color: "#F4F4F4",
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
