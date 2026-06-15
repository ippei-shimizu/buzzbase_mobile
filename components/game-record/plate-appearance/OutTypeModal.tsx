import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { OUT_TYPE_OPTIONS, type OutTypeOption } from "@constants/plateResults";

interface Props {
  visible: boolean;
  onSelect: (option: OutTypeOption) => void;
  onCancel: () => void;
}

/**
 * 「アウト」ボタン押下時のサブ選択モーダル。
 * 選択結果は `plate_result_id` と `out_type` のペアで親に返す。
 */
export function OutTypeModal({ visible, onSelect, onCancel }: Props) {
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
          <Text style={styles.title}>アウト種別</Text>
          {OUT_TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.out_type}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={styles.option}
              onPress={() => onSelect(option)}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
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
  option: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d08000",
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    color: "#d08000",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});
