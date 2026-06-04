import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  plateAppearance: PlateAppearanceV2;
  onPress?: () => void;
  onLongPress?: () => void;
}

/**
 * 打席リストに 1 行ずつ並ぶカード UI。
 * 「第N打席」と `batting_result`（"中安" 等のサーバー生成テキスト）を主表示し、
 * `has_detail_data === false` のときに「詳細未入力」バッジを出す。
 * 打点が 0 でないときだけ補助情報として表示する。
 */
export function PlateAppearanceCard({
  plateAppearance,
  onPress,
  onLongPress,
}: Props) {
  const hasDetail = plateAppearance.has_detail_data;
  const rbi = plateAppearance.rbi ?? 0;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`第${plateAppearance.batter_box_number}打席 ${plateAppearance.batting_result}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.boxNumber}>
          第{plateAppearance.batter_box_number}打席
        </Text>
        <Text style={styles.battingResult}>
          {plateAppearance.batting_result || "未入力"}
        </Text>
      </View>
      <View style={styles.footerRow}>
        <View style={styles.badges}>
          {rbi > 0 && <Text style={styles.metaText}>打点 {rbi}</Text>}
          {!hasDetail && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeLabel}>詳細未入力</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
      </View>
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  boxNumber: {
    color: "#A1A1AA",
    fontSize: 13,
    minWidth: 70,
  },
  battingResult: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});
