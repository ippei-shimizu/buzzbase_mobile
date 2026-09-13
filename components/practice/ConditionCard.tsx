import type { IconName } from "../../types/icon";
import type { ConditionLog } from "../../types/practice";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Icon } from "@components/icon/Icon";

const LEVEL_META: { icon: IconName; color: string }[] = [
  { icon: "remove", color: "#71717A" },
  { icon: "sad", color: "#ef4444" },
  { icon: "sad-outline", color: "#f59e0b" },
  { icon: "happy-outline", color: "#84cc16" },
  { icon: "happy", color: "#22c55e" },
];
const FATIGUE_LABELS = ["", "かなり疲れ", "やや疲れ", "ふつう", "元気"];
const PHYSICAL_LABELS = ["", "不調", "やや不調", "ふつう", "好調"];

function ConditionFace({
  title,
  level,
  labels,
}: {
  title: string;
  level: number;
  labels: string[];
}) {
  const meta = LEVEL_META[level] ?? LEVEL_META[0];
  return (
    <View style={styles.faceTile}>
      <Text style={styles.faceTitle}>{title}</Text>
      <Icon name={meta.icon} size={30} color={meta.color} />
      <Text style={styles.faceLabel}>{labels[level] ?? "-"}</Text>
    </View>
  );
}

/**
 * 描画する範囲。無料項目（疲労度・体調）と Pro 限定項目（睡眠・気分・怪我・メモ）は
 * 呼び出し元が別々に扱えるよう、セクション単位で描き分けられるようにする。
 */
export type ConditionSection = "all" | "basic" | "detail";

/** Pro 限定セクションに表示できる値があるか。無いときはサンプルのプレビューへ差し替える。 */
export function hasConditionDetail(condition: ConditionLog): boolean {
  return (
    condition.sleep_hours != null ||
    Boolean(condition.mood) ||
    Boolean(condition.memo) ||
    (condition.injuries ?? []).length > 0
  );
}

/**
 * 練習記録・野球ノートの詳細画面で共通利用するコンディション表示カード。
 * section で無料項目 / Pro 限定項目のどちらを描くかを選べる。
 */
export function ConditionCard({
  condition,
  style,
  showTitle = true,
  section = "all",
}: {
  condition: ConditionLog;
  /** 呼び出し元のレイアウトに合わせて外枠（marginTop・区切り線等）を上書きする。 */
  style?: StyleProp<ViewStyle>;
  /** 呼び出し元が独自に見出しを描画する場合は false にして内部見出しの二重表示を防ぐ。 */
  showTitle?: boolean;
  section?: ConditionSection;
}) {
  const showsBasic = section !== "detail";
  const showsDetail = section !== "basic";
  const chips: { icon: IconName; text: string }[] = [];
  if (condition.sleep_hours != null) {
    chips.push({ icon: "moon", text: `睡眠 ${condition.sleep_hours}h` });
  }
  if (condition.mood) chips.push({ icon: "sparkles", text: condition.mood });
  const injuries = (condition.injuries ?? [])
    .map((injury) => injury.part)
    .filter(Boolean);

  return (
    <View style={[styles.conditionCard, style]}>
      {showTitle ? (
        <Text style={styles.sectionTitle}>コンディション</Text>
      ) : null}
      {showsBasic &&
      (condition.fatigue_level != null || condition.physical_level != null) ? (
        <View style={styles.faceRow}>
          {condition.fatigue_level != null ? (
            <ConditionFace
              title="疲労度"
              level={condition.fatigue_level}
              labels={FATIGUE_LABELS}
            />
          ) : null}
          {condition.physical_level != null ? (
            <ConditionFace
              title="体調"
              level={condition.physical_level}
              labels={PHYSICAL_LABELS}
            />
          ) : null}
        </View>
      ) : null}
      {showsDetail && chips.length > 0 ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <View key={chip.text} style={styles.condChip}>
              <Icon name={chip.icon} size={13} color="#A1A1AA" />
              <Text style={styles.condChipText}>{chip.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {showsDetail && injuries.length > 0 ? (
        <View style={styles.chipRow}>
          {injuries.map((part) => (
            <View key={part} style={styles.injuryChip}>
              <Icon name="medkit" size={13} color="#fca5a5" />
              <Text style={styles.injuryChipText}>{part}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {showsDetail && condition.memo ? (
        <Text style={styles.conditionMemo}>{condition.memo}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  conditionCard: { marginTop: 8 },
  faceRow: { flexDirection: "row", gap: 10 },
  faceTile: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  faceTitle: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  faceLabel: { color: "#F4F4F4", fontSize: 13, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  condChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  condChipText: { color: "#F4F4F4", fontSize: 12, fontWeight: "600" },
  injuryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  injuryChipText: { color: "#fca5a5", fontSize: 12, fontWeight: "600" },
  conditionMemo: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    fontStyle: "italic",
  },
});
