import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getBattingResultColor } from "@utils/battingResultColor";
import {
  buildPitchAndPitcherChips,
  buildSituationChips,
} from "@utils/plateAppearanceChips";

interface Props {
  plateAppearance: PlateAppearanceV2;
  onPress?: () => void;
  onLongPress?: () => void;
}

interface MetaItem {
  label: string;
  value: number;
}

const buildMetaItems = (pa: PlateAppearanceV2): MetaItem[] => {
  const items: MetaItem[] = [];
  if ((pa.rbi ?? 0) > 0) items.push({ label: "打点", value: pa.rbi as number });
  if ((pa.run_scored ?? 0) > 0)
    items.push({ label: "得点", value: pa.run_scored as number });
  if ((pa.stolen_bases ?? 0) > 0)
    items.push({ label: "盗塁", value: pa.stolen_bases as number });
  if ((pa.caught_stealing ?? 0) > 0)
    items.push({ label: "盗塁死", value: pa.caught_stealing as number });
  return items;
};

/**
 * 打席リストに 1 行ずつ並ぶカード UI。
 * 上段: 「第N打席」 + 「batting_result（試合一覧と同色のヒット系赤）」
 * 下段1: 打点・得点・盗塁・盗塁死（1 以上のみ）+ 「詳細未入力」バッジ
 * 下段2: 状況チップ（イニング / カウント / ランナー / 初球打ち）
 * 下段3: 打球・投手チップ（球質 / タイミング / 球種 / 投手 / 登板状況）
 * 右端の chevron は縦中央に配置。
 */
export function PlateAppearanceCard({
  plateAppearance,
  onPress,
  onLongPress,
}: Props) {
  const hasDetail = plateAppearance.has_detail_data;
  const resultText = plateAppearance.batting_result || "未入力";
  const resultColor = getBattingResultColor(resultText);
  const metaItems = buildMetaItems(plateAppearance);
  const situationChips = buildSituationChips(plateAppearance);
  const pitchChips = buildPitchAndPitcherChips(plateAppearance);
  const showMetaRow = metaItems.length > 0 || !hasDetail;
  // どちらのハンドラも渡されていない場合は読み取り専用カードとして
  // chevron を非表示にし、タッチ判定も無効化する（試合詳細の情報表示で利用）。
  const isInteractive = onPress !== undefined || onLongPress !== undefined;
  const accessibilityLabel = `第${plateAppearance.batter_box_number}打席 ${plateAppearance.batting_result}`;

  const content = (
    <>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.boxNumber}>
            第{plateAppearance.batter_box_number}打席
          </Text>
          <Text style={[styles.battingResult, { color: resultColor }]}>
            {resultText}
          </Text>
        </View>
        {showMetaRow && (
          <View style={styles.metaRow}>
            {metaItems.map((item) => (
              <Text key={item.label} style={styles.metaText}>
                {item.label} {item.value}
              </Text>
            ))}
            {!hasDetail && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeLabel}>詳細未入力</Text>
              </View>
            )}
          </View>
        )}
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
              <View key={`p-${chip}`} style={[styles.chip, styles.chipAccent]}>
                <Text style={[styles.chipText, styles.chipTextAccent]}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {isInteractive && (
        <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
      )}
    </>
  );

  if (!isInteractive) {
    return (
      <View accessibilityLabel={accessibilityLabel} style={styles.card}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.card}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  boxNumber: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  battingResult: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metaText: {
    color: "#D4D4D8",
    fontSize: 13,
  },
  detailBadge: {
    backgroundColor: "#52525B",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  detailBadgeLabel: {
    color: "#F4F4F4",
    fontSize: 11,
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
});
