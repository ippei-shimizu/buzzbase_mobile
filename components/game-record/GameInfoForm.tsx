import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { TextInput } from "@components/ui/TextInput";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SelectPicker } from "@components/ui/SelectPicker";
import { NumberInput } from "@components/ui/NumberInput";
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
  seasonId: number | null;
  seasons: Season[];
  teams: Team[];
  positions: Position[];
  isSubmitting: boolean;
  errors: string[];
  onFieldChange: (field: string, value: string | number | null) => void;
  onSubmit: () => void;
}

const MATCH_TYPES = ["練習試合", "公式戦", "オープン戦"];
const BATTING_ORDERS = Array.from({ length: 10 }, (_, i) => ({
  label: i === 9 ? "DH" : `${i + 1}番`,
  value: i === 9 ? "DH" : String(i + 1),
}));

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

  const matchTypeIndex = MATCH_TYPES.indexOf(matchType);

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

  const positionItems = positions.map((p) => ({
    label: p.name,
    value: p.name,
  }));

  const seasonItems = [
    { label: "なし", value: "" },
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
      <View
        style={{
          backgroundColor: "#3a3a3a",
          borderRadius: 8,
          marginTop: -12,
          marginBottom: 12,
          maxHeight: 150,
        }}
      >
        <FlatList
          data={filteredTeams.slice(0, 5)}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              onPress={() => onSelect(item)}
            >
              <Text style={{ color: "#F4F4F4", fontSize: 14 }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {errors.length > 0 && (
        <View
          style={{
            backgroundColor: "rgba(243,18,96,0.1)",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {errors.map((e) => (
            <Text key={e} style={{ color: "#F31260", fontSize: 13 }}>
              {e}
            </Text>
          ))}
        </View>
      )}

      {/* 日付 */}
      <TextInput
        label="試合日"
        value={date}
        onChangeText={(v) => onFieldChange("date", v)}
        placeholder="YYYY-MM-DD"
      />

      {/* 試合種類 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: "#D4D4D8" }}>
          試合種類
        </Text>
        <SegmentedControl
          options={MATCH_TYPES}
          selectedIndex={matchTypeIndex >= 0 ? matchTypeIndex : 0}
          onSelect={(i) => onFieldChange("matchType", MATCH_TYPES[i])}
        />
      </View>

      {/* 自チーム */}
      <TextInput
        label="自チーム名"
        value={myTeamName}
        onChangeText={(v) => {
          onFieldChange("myTeamName", v);
          onFieldChange("myTeamId", null);
          setShowMyTeamSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowMyTeamSuggestions(false), 200)}
        placeholder="チーム名を入力"
      />
      {renderTeamSuggestions(
        filteredMyTeams,
        (team) => {
          onFieldChange("myTeamName", team.name);
          onFieldChange("myTeamId", team.id);
          setShowMyTeamSuggestions(false);
        },
        showMyTeamSuggestions,
      )}

      {/* 相手チーム */}
      <TextInput
        label="相手チーム名"
        value={opponentTeamName}
        onChangeText={(v) => {
          onFieldChange("opponentTeamName", v);
          onFieldChange("opponentTeamId", null);
          setShowOpponentTeamSuggestions(true);
        }}
        onBlur={() =>
          setTimeout(() => setShowOpponentTeamSuggestions(false), 200)
        }
        placeholder="チーム名を入力"
      />
      {renderTeamSuggestions(
        filteredOpponentTeams,
        (team) => {
          onFieldChange("opponentTeamName", team.name);
          onFieldChange("opponentTeamId", team.id);
          setShowOpponentTeamSuggestions(false);
        },
        showOpponentTeamSuggestions,
      )}

      {/* スコア */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: "#D4D4D8" }}>
          スコア
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#A1A1AA", fontSize: 12, marginBottom: 4 }}>
              自チーム
            </Text>
            <NumberInput
              value={myTeamScore}
              onChangeValue={(v) => onFieldChange("myTeamScore", v)}
              style={{ width: 80 }}
            />
          </View>
          <Text style={{ color: "#F4F4F4", fontSize: 24, fontWeight: "bold" }}>
            -
          </Text>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#A1A1AA", fontSize: 12, marginBottom: 4 }}>
              相手チーム
            </Text>
            <NumberInput
              value={opponentTeamScore}
              onChangeValue={(v) => onFieldChange("opponentTeamScore", v)}
              style={{ width: 80 }}
            />
          </View>
        </View>
      </View>

      {/* 打順 */}
      <SelectPicker
        label="打順"
        items={BATTING_ORDERS}
        selectedValue={battingOrder}
        onSelect={(v) => onFieldChange("battingOrder", String(v))}
      />

      {/* 守備位置 */}
      <SelectPicker
        label="守備位置"
        items={positionItems}
        selectedValue={defensivePosition}
        onSelect={(v) => onFieldChange("defensivePosition", String(v))}
      />

      {/* メモ */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 4, fontSize: 14, color: "#D4D4D8" }}>
          メモ
        </Text>
        <RNTextInput
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#52525B",
            backgroundColor: "#424242",
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: "#F4F4F4",
            fontSize: 16,
            minHeight: 80,
            textAlignVertical: "top",
          }}
          multiline
          value={memo}
          onChangeText={(v) => onFieldChange("memo", v)}
          placeholder="試合のメモ（任意）"
          placeholderTextColor="#71717A"
        />
      </View>

      {/* シーズン */}
      {seasons.length > 0 && (
        <SelectPicker
          label="シーズン（任意）"
          items={seasonItems}
          selectedValue={seasonId ? String(seasonId) : ""}
          onSelect={(v) => onFieldChange("seasonId", v ? Number(v) : null)}
        />
      )}

      <Button
        title="次へ：打撃成績"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={{ marginBottom: 40 }}
      />
    </ScrollView>
  );
}
