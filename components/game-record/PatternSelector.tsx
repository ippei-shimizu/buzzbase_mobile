import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type RecordPattern = "batting" | "pitching" | "both";

interface Props {
  onSelect: (pattern: RecordPattern) => void;
  disabled?: boolean;
}

interface OptionDef {
  pattern: RecordPattern;
  title: string;
  variant: "primary" | "outlined";
}

const OPTIONS: OptionDef[] = [
  { pattern: "batting", title: "打撃結果のみ入力", variant: "outlined" },
  { pattern: "pitching", title: "投手結果のみ入力", variant: "outlined" },
  { pattern: "both", title: "打撃・投手記録を入力", variant: "primary" },
];

const PRIMARY_COLOR = "#d08000";
const TEXT_ON_PRIMARY = "#F4F4F4";

/**
 * 試合記録のパターン分岐を選択する UI。
 * 「両方記録」を一番推奨アクションとして primary 塗りつぶし、
 * 「打撃のみ / 投手のみ」を outlined で階層化する。
 */
export function PatternSelector({ onSelect, disabled }: Props) {
  return (
    <View style={{ marginBottom: 40 }}>
      {OPTIONS.map((option) => {
        const isPrimary = option.variant === "primary";
        const textColor = isPrimary ? TEXT_ON_PRIMARY : PRIMARY_COLOR;
        return (
          <TouchableOpacity
            key={option.pattern}
            onPress={() => onSelect(option.pattern)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            accessibilityState={{ disabled }}
            style={[
              styles.button,
              isPrimary ? styles.buttonPrimary : styles.buttonOutlined,
              disabled && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.label, { color: textColor }]}>
              {option.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={textColor}
              style={styles.chevron}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: PRIMARY_COLOR,
  },
  buttonOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chevron: {
    position: "absolute",
    right: 16,
  },
});
