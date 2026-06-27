import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HIT_TYPE_OPTIONS, type HitTypeOption } from "@constants/plateResults";

interface Props {
  visible: boolean;
  onSelect: (option: HitTypeOption) => void;
  onCancel: () => void;
}

/**
 * 「ヒット」ボタン押下時のサブ選択モーダル。
 * 単打 / 二塁打 / 三塁打 / 本塁打を 1 行 4 列のチップで提示し、
 * 選択結果は `plate_result_id` と `hit_type` のペアで親に返す。
 */
export function HitTypeModal({ visible, onSelect, onCancel }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel} accessible={false}>
        <Pressable
          style={styles.sheet}
          onPress={(event) => event.stopPropagation()}
          accessible={false}
        >
          <Text style={styles.title}>ヒット種別</Text>
          <View style={styles.row}>
            {HIT_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.hit_type}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                style={styles.option}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="キャンセル"
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelLabel}>キャンセル</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d08000",
    paddingVertical: 12,
    alignItems: "center",
  },
  optionLabel: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});
