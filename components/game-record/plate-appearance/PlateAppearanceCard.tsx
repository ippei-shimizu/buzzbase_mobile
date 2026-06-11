import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RUNNERS_STATE_OPTIONS } from "@constants/runnersState";
import { getBattingResultColor } from "@utils/battingResultColor";

interface Props {
  plateAppearance: PlateAppearanceV2;
  onPress?: () => void;
  onLongPress?: () => void;
}

interface MetaItem {
  label: string;
  value: number;
}

const THROW_HAND_LABELS: Record<string, string> = {
  right: "右",
  left: "左",
};

const RUNNERS_STATE_LABELS: Record<string, string> = Object.fromEntries(
  RUNNERS_STATE_OPTIONS.map((option) => [option.key, option.label]),
);

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

const formatCount = (
  balls: number | null,
  strikes: number | null,
  outs: number | null,
): string | null => {
  if (balls === null && strikes === null && outs === null) return null;
  const b = balls ?? "-";
  const s = strikes ?? "-";
  const o = outs ?? "-";
  return `B${b}-S${s}-O${o}`;
};

/** 打席状況（イニング / カウント / ランナー / 初球打ち）を入力済みのものだけ返す。 */
const buildSituationChips = (pa: PlateAppearanceV2): string[] => {
  const chips: string[] = [];
  if (pa.inning !== null) chips.push(`${pa.inning} 回`);
  const count = formatCount(pa.final_balls, pa.final_strikes, pa.final_outs);
  if (count) chips.push(count);
  if (pa.runners_state) {
    const label = RUNNERS_STATE_LABELS[pa.runners_state];
    if (label) chips.push(label);
  }
  if (pa.first_pitch_swing === true) chips.push("初球○");
  return chips;
};

/** 打球・投手系（球質 / タイミング / 球種 / 投手 / 登板状況）を入力済みのものだけ返す。 */
const buildPitchAndPitcherChips = (pa: PlateAppearanceV2): string[] => {
  const chips: string[] = [];
  if (pa.contact_quality?.name) chips.push(pa.contact_quality.name);
  if (pa.timing?.name) chips.push(pa.timing.name);
  if (pa.pitch_type?.name) chips.push(pa.pitch_type.name);
  if (pa.pitcher) {
    const hand = pa.pitcher.throw_hand
      ? `(${THROW_HAND_LABELS[pa.pitcher.throw_hand] ?? pa.pitcher.throw_hand})`
      : "";
    chips.push(`${pa.pitcher.name}${hand}`);
  }
  if (pa.appearance_situation?.name) chips.push(pa.appearance_situation.name);
  return chips;
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

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`第${plateAppearance.batter_box_number}打席 ${plateAppearance.batting_result}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.card}
    >
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
      <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
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
