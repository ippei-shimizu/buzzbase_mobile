import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type RecordPattern = "batting" | "pitching" | "both";

interface Props {
  onSelect: (pattern: RecordPattern) => void;
}

interface OptionDef {
  pattern: RecordPattern;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: OptionDef[] = [
  {
    pattern: "batting",
    title: "打撃結果のみ入力",
    description: "バッターとして打席を記録します",
    icon: "baseball-outline",
  },
  {
    pattern: "pitching",
    title: "投手結果のみ入力",
    description: "ピッチャーとして登板を記録します",
    icon: "trophy-outline",
  },
  {
    pattern: "both",
    title: "打撃・投手記録を入力",
    description: "両方を記録します",
    icon: "swap-horizontal-outline",
  },
];

/**
 * 試合記録のパターン分岐を選択する UI。
 * 選択結果はクライアント状態のみ（DB には保存しない）。
 */
export function PatternSelector({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>どの記録を入力しますか？</Text>
      {OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.pattern}
          style={styles.card}
          onPress={() => onSelect(option.pattern)}
          accessibilityRole="button"
          accessibilityLabel={option.title}
        >
          <Ionicons
            name={option.icon}
            size={28}
            color="#d08000"
            style={styles.icon}
          />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardDescription}>{option.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: "#2E2E2E",
  },
  heading: {
    fontSize: 18,
    color: "#F4F4F4",
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#424242",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F4F4F4",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#A1A1AA",
  },
});
