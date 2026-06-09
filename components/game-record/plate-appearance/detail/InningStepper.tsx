import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

const PRIMARY_COLOR = "#d08000";
const DISABLED_COLOR = "#52525B";
const MIN_INNING = 1;

/**
 * イニング数のステッパー入力（null 許容）。
 * 「-」で 1 を下回ると null（未入力）に戻る。これにより「未入力」と「1 回」を明示的に区別できる。
 */
export function InningStepper({ value, onChange }: Props) {
  const decrement = () => {
    if (value === null) {
      onChange(null);
      return;
    }
    const next = value - 1;
    onChange(next < MIN_INNING ? null : next);
  };
  const increment = () => {
    onChange(value === null ? MIN_INNING : value + 1);
  };
  const decrementDisabled = value === null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>イニング</Text>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="イニングを減らす"
          accessibilityState={{ disabled: decrementDisabled }}
          disabled={decrementDisabled}
          onPress={decrement}
          hitSlop={6}
        >
          <Ionicons
            name="remove-circle"
            size={28}
            color={decrementDisabled ? DISABLED_COLOR : PRIMARY_COLOR}
          />
        </TouchableOpacity>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>
            {value === null ? "-" : `${value} 回`}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="イニングを増やす"
          onPress={increment}
          hitSlop={6}
        >
          <Ionicons name="add-circle" size={28} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        {value !== null && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="イニングをクリア"
            style={styles.clearButton}
            onPress={() => onChange(null)}
          >
            <Text style={styles.clearLabel}>クリア</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  valueBox: {
    minWidth: 80,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    alignItems: "center",
  },
  valueText: {
    color: "#F4F4F4",
    fontSize: 15,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearLabel: {
    color: "#A1A1AA",
    fontSize: 13,
  },
});
