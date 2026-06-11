import type { PlateAppearanceV2 } from "../../types/plateAppearance";
import { StyleSheet, Text, View } from "react-native";
import { getBattingResultColor } from "@utils/battingResultColor";
import {
  buildPitchAndPitcherChips,
  buildSituationChips,
} from "@utils/plateAppearanceChips";

interface Props {
  plateAppearance: PlateAppearanceV2;
}

/**
 * 試合サマリー画面で 1 打席分の詳細情報を表示する表示専用カード。
 * 打席リストの編集用カード（PlateAppearanceCard）とはタップ不可・コンパクトな点で差別化する。
 */
export function PlateAppearanceSummaryCard({ plateAppearance }: Props) {
  const resultText = plateAppearance.batting_result || "未入力";
  const resultColor = getBattingResultColor(resultText);
  const situationChips = buildSituationChips(plateAppearance);
  const pitchChips = buildPitchAndPitcherChips(plateAppearance);
  const hasAnyDetail = situationChips.length > 0 || pitchChips.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.boxNumber}>
          第{plateAppearance.batter_box_number}打席
        </Text>
        <Text style={[styles.result, { color: resultColor }]}>
          {resultText}
        </Text>
      </View>
      {hasAnyDetail ? (
        <>
          {situationChips.length > 0 && (
            <View style={styles.chipRow}>
              {situationChips.map((chip) => (
                <View key={`s-${chip}`} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          )}
          {pitchChips.length > 0 && (
            <View style={styles.chipRow}>
              {pitchChips.map((chip) => (
                <View
                  key={`p-${chip}`}
                  style={[styles.chip, styles.chipAccent]}
                >
                  <Text style={[styles.chipText, styles.chipTextAccent]}>
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.unfilled}>詳細未入力</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  boxNumber: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  result: {
    fontSize: 14,
    fontWeight: "bold",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#424242",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    color: "#D4D4D8",
    fontSize: 11,
  },
  chipAccent: {
    backgroundColor: "#3a3024",
    borderWidth: 1,
    borderColor: "#d08000",
  },
  chipTextAccent: {
    color: "#F4F4F4",
  },
  unfilled: {
    color: "#71717A",
    fontSize: 11,
  },
});
