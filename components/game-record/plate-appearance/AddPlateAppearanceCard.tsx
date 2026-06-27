import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  batterBoxNumber: number;
  onPress: () => void;
}

/**
 * 打席リストの末尾に常に表示される「次の打席の結果を入力する」プレースホルダ。
 * 左に「第N打席」ラベル、右に pill 形状の primary ボタンを並べる。
 * 「結果を入力」というラベルで、これからその打席の打撃結果を記録するという
 * 行為を明示する（"追加" のような管理操作的なニュアンスを避ける）。
 */
export function AddPlateAppearanceCard({ batterBoxNumber, onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.boxNumber}>第{batterBoxNumber}打席</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`第${batterBoxNumber}打席の結果を入力`}
        onPress={onPress}
        style={styles.button}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={16} color="#F4F4F4" />
        <Text style={styles.buttonLabel}>結果を入力</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#d08000",
  },
  boxNumber: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#d08000",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  buttonLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "bold",
  },
});
