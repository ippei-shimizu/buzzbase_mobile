import type { CountSituation, CountSituations } from "../../types/stats";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CountSituationCardsProps {
  data: CountSituations;
}

interface CellConfig {
  key: keyof Pick<
    CountSituations,
    "first_pitch" | "favorable_count" | "pinch_count"
  >;
  label: string;
  tooltip: string;
}

const CELLS: readonly CellConfig[] = [
  {
    key: "first_pitch",
    label: "初球",
    tooltip:
      "初球を振った打席だけを集計した打率です。積極性が分かる指標で、高いほど初球から打ちに行って結果を出していることを意味します。",
  },
  {
    key: "favorable_count",
    label: "有利カウント",
    tooltip:
      "最終カウントが「ボール > ストライク」になった打席（2-0、3-1 など）の打率です。打者有利のカウントでどれくらい仕留められているかが分かります。",
  },
  {
    key: "pinch_count",
    label: "追い込み",
    tooltip:
      "最終カウントのストライクが 2 だった打席（0-2、1-2、2-2、3-2 など）の打率です。追い込まれてから粘って結果を出した割合を示します。",
  },
] as const;

const formatAverage = (situation: CountSituation): string => {
  if (situation.at_bats === 0) return ".---";
  return situation.batting_average.toFixed(3).replace(/^0\./, ".");
};

export const CountSituationCards = ({ data }: CountSituationCardsProps) => {
  const [openTooltipKey, setOpenTooltipKey] = useState<string | null>(null);
  const openCell = CELLS.find((cell) => cell.key === openTooltipKey) ?? null;

  if (data.total_target_pa === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>カウント別の打率</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席のみが対象です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>カウント別の打率</Text>
        <Text style={styles.targetCount}>対象 {data.total_target_pa} 打席</Text>
      </View>
      <View style={styles.row}>
        {CELLS.map((cell) => {
          const situation = data[cell.key];
          return (
            <View key={cell.key} style={styles.cell}>
              <View style={styles.cellLabelRow}>
                <Text style={styles.cellLabel}>{cell.label}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.label}の説明を表示`}
                  onPress={() => setOpenTooltipKey(cell.key)}
                  hitSlop={6}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={14}
                    color="#A1A1AA"
                  />
                </Pressable>
              </View>
              <Text style={styles.cellAverage}>{formatAverage(situation)}</Text>
              <Text style={styles.cellCount}>
                {situation.at_bats}打数 {situation.hits}安打
              </Text>
            </View>
          );
        })}
      </View>

      <Modal
        visible={openCell !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenTooltipKey(null)}
      >
        <TouchableWithoutFeedback onPress={() => setOpenTooltipKey(null)}>
          <View style={styles.tooltipOverlay}>
            <View style={styles.tooltipBubble}>
              <Text style={styles.tooltipTitle}>{openCell?.label}</Text>
              <Text style={styles.tooltipText}>{openCell?.tooltip}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  targetCount: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#27272A",
    borderRadius: 8,
  },
  cellLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  cellLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  tooltipBubble: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  tooltipTitle: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  tooltipText: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 19,
  },
  cellAverage: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  cellCount: {
    color: "#71717A",
    fontSize: 10,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyNote: {
    color: "#71717A",
    fontSize: 11,
  },
});
