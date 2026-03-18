import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SelectPicker } from "@components/ui/SelectPicker";
import { Button } from "@components/ui/Button";
import type { Team, Position } from "../../types/gameRecord";
import type { Season } from "../../types/season";

interface Props {
  date: string;
  matchType: string;
  myTeamName: string;
  myTeamId: number | null;
  opponentTeamName: string;
  opponentTeamId: number | null;
  myTeamScore: number;
  opponentTeamScore: number;
  battingOrder: string;
  defensivePosition: string;
  memo: string;
  tournamentName: string;
  tournamentId: number | null;
  tournaments: { id: number; name: string }[];
  seasonId: number | null;
  seasons: Season[];
  teams: Team[];
  positions: Position[];
  isSubmitting: boolean;
  errors: string[];
  onFieldChange: (field: string, value: string | number | null) => void;
  onSubmit: () => void;
}

const BATTING_ORDERS = Array.from({ length: 10 }, (_, i) => ({
  label: i === 9 ? "DH" : `${i + 1}番`,
  value: i === 9 ? "DH" : String(i + 1),
}));

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formRow}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.formInput}>{children}</View>
    </View>
  );
}

export function GameInfoForm({
  date,
  matchType,
  myTeamName,
  myTeamId,
  opponentTeamName,
  opponentTeamId,
  myTeamScore,
  opponentTeamScore,
  battingOrder,
  defensivePosition,
  memo,
  tournamentName,
  tournamentId,
  tournaments,
  seasonId,
  seasons,
  teams,
  positions,
  isSubmitting,
  errors,
  onFieldChange,
  onSubmit,
}: Props) {
  const [showMyTeamSuggestions, setShowMyTeamSuggestions] = useState(false);
  const [showOpponentTeamSuggestions, setShowOpponentTeamSuggestions] =
    useState(false);
  const [showTournamentSuggestions, setShowTournamentSuggestions] =
    useState(false);

  const filteredMyTeams = useMemo(
    () =>
      myTeamName.length > 0
        ? teams.filter((t) =>
            t.name.toLowerCase().includes(myTeamName.toLowerCase()),
          )
        : [],
    [myTeamName, teams],
  );

  const filteredOpponentTeams = useMemo(
    () =>
      opponentTeamName.length > 0
        ? teams.filter((t) =>
            t.name.toLowerCase().includes(opponentTeamName.toLowerCase()),
          )
        : [],
    [opponentTeamName, teams],
  );

  const filteredTournaments = useMemo(
    () =>
      tournamentName.length > 0
        ? tournaments.filter((t) =>
            t.name.toLowerCase().includes(tournamentName.toLowerCase()),
          )
        : tournaments,
    [tournamentName, tournaments],
  );

  const positionItems = positions.map((p) => ({
    label: p.name,
    value: p.name,
  }));

  const seasonItems = [
    { label: "シーズン名を入力", value: "" },
    ...seasons.map((s) => ({
      label: s.name,
      value: String(s.id),
    })),
  ];

  const renderTeamSuggestions = (
    filteredTeams: Team[],
    onSelect: (team: Team) => void,
    show: boolean,
  ) => {
    if (!show || filteredTeams.length === 0) return null;
    return (
      <View style={styles.suggestions}>
        <FlatList
          data={filteredTeams.slice(0, 5)}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>試合結果を入力しよう！</Text>

      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {errors.map((e) => (
            <Text key={e} style={styles.errorText}>
              {e}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.formCard}>
        {/* 試合日付 */}
        <FormRow label="試合日付" required>
          <RNTextInput
            style={styles.input}
            value={date}
            onChangeText={(v) => onFieldChange("date", v)}
            placeholder="YYYY/MM/DD"
            placeholderTextColor="#71717A"
          />
        </FormRow>

        <View style={styles.divider} />

        {/* 試合種類 */}
        <FormRow label="試合種類" required>
          <View style={styles.radioGroup}>
            {["公式戦", "オープン戦"].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => onFieldChange("matchType", type)}
              >
                <View style={styles.radioOuter}>
                  {matchType === type && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* 大会名 */}
        <FormRow label="大会名">
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={tournamentName}
              onChangeText={(v) => {
                onFieldChange("tournamentName", v);
                onFieldChange("tournamentId", null);
                setShowTournamentSuggestions(true);
              }}
              onFocus={() => setShowTournamentSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowTournamentSuggestions(false), 200)
              }
              placeholder="大会名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {showTournamentSuggestions && filteredTournaments.length > 0 && (
          <View style={styles.suggestions}>
            <FlatList
              data={filteredTournaments.slice(0, 5)}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    onFieldChange("tournamentName", item.name);
                    onFieldChange("tournamentId", item.id);
                    setShowTournamentSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.divider} />

        {/* シーズン */}
        {seasons.length > 0 && (
          <>
            <FormRow label="シーズン">
              <SelectPicker
                items={seasonItems}
                selectedValue={seasonId ? String(seasonId) : ""}
                onSelect={(v) =>
                  onFieldChange("seasonId", v ? Number(v) : null)
                }
                compact
              />
            </FormRow>
            <View style={styles.divider} />
          </>
        )}

        {/* 自チーム */}
        <FormRow label="自チーム" required>
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={myTeamName}
              onChangeText={(v) => {
                onFieldChange("myTeamName", v);
                onFieldChange("myTeamId", null);
                setShowMyTeamSuggestions(true);
              }}
              onFocus={() => setShowMyTeamSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowMyTeamSuggestions(false), 200)
              }
              placeholder="チーム名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {renderTeamSuggestions(
          filteredMyTeams,
          (team) => {
            onFieldChange("myTeamName", team.name);
            onFieldChange("myTeamId", team.id);
            setShowMyTeamSuggestions(false);
          },
          showMyTeamSuggestions,
        )}

        <View style={styles.divider} />

        {/* 相手チーム */}
        <FormRow label="相手チーム" required>
          <View style={styles.comboBox}>
            <RNTextInput
              style={styles.comboInput}
              value={opponentTeamName}
              onChangeText={(v) => {
                onFieldChange("opponentTeamName", v);
                onFieldChange("opponentTeamId", null);
                setShowOpponentTeamSuggestions(true);
              }}
              onFocus={() => setShowOpponentTeamSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowOpponentTeamSuggestions(false), 200)
              }
              placeholder="相手のチーム名を入力"
              placeholderTextColor="#71717A"
            />
            <Ionicons name="chevron-down" size={16} color="#A1A1AA" />
          </View>
        </FormRow>
        {renderTeamSuggestions(
          filteredOpponentTeams,
          (team) => {
            onFieldChange("opponentTeamName", team.name);
            onFieldChange("opponentTeamId", team.id);
            setShowOpponentTeamSuggestions(false);
          },
          showOpponentTeamSuggestions,
        )}

        <View style={styles.divider} />

        {/* 点数 */}
        <FormRow label="点数" required>
          <View style={styles.scoreRow}>
            <RNTextInput
              style={styles.scoreInput}
              value={myTeamScore > 0 ? String(myTeamScore) : ""}
              onChangeText={(v) =>
                onFieldChange("myTeamScore", parseInt(v) || 0)
              }
              placeholder="自分"
              placeholderTextColor="#71717A"
              keyboardType="number-pad"
            />
            <Text style={styles.scoreSeparator}>対</Text>
            <RNTextInput
              style={styles.scoreInput}
              value={opponentTeamScore > 0 ? String(opponentTeamScore) : ""}
              onChangeText={(v) =>
                onFieldChange("opponentTeamScore", parseInt(v) || 0)
              }
              placeholder="相手"
              placeholderTextColor="#71717A"
              keyboardType="number-pad"
            />
          </View>
        </FormRow>

        <View style={styles.divider} />

        {/* 打順 */}
        <FormRow label="打順" required>
          <SelectPicker
            items={BATTING_ORDERS}
            selectedValue={battingOrder}
            onSelect={(v) => onFieldChange("battingOrder", String(v))}
            compact
          />
        </FormRow>

        <View style={styles.divider} />

        {/* 守備位置 */}
        <FormRow label="守備位置" required>
          <SelectPicker
            items={positionItems}
            selectedValue={defensivePosition}
            onSelect={(v) => onFieldChange("defensivePosition", String(v))}
            compact
          />
        </FormRow>
      </View>

      {/* メモ */}
      <View style={styles.memoSection}>
        <Text style={styles.memoLabel}>メモ</Text>
        <RNTextInput
          style={styles.memoInput}
          multiline
          value={memo}
          onChangeText={(v) => onFieldChange("memo", v)}
          placeholder="試合の中で気づいたこと、感じたことをメモしておこう！"
          placeholderTextColor="#71717A"
        />
      </View>

      <Button
        title="打撃成績入力へ"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={{ marginBottom: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  heading: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "rgba(243,18,96,0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#F31260",
    fontSize: 13,
  },
  formCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  formLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    width: 90,
  },
  required: {
    color: "#EF4444",
  },
  formInput: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#3f3f46",
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
  },
  comboBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingRight: 12,
  },
  comboInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#71717A",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d08000",
  },
  radioLabel: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
    textAlign: "center",
  },
  scoreSeparator: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestions: {
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 8,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  suggestionText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  memoSection: {
    marginBottom: 20,
  },
  memoLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  memoInput: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
