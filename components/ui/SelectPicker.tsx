import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PickerItem {
  label: string;
  value: string | number;
}

interface Props {
  label: string;
  items: PickerItem[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  showClear?: boolean;
}

export function SelectPicker({
  label,
  items,
  selectedValue,
  onSelect,
  placeholder = "選択してください",
  showClear = false,
}: Props) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = items.find((i) => i.value === selectedValue)?.label;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text
          style={[
            styles.triggerText,
            !selectedLabel && styles.triggerPlaceholder,
          ]}
        >
          {selectedLabel || placeholder}
        </Text>
        <View style={styles.triggerActions}>
          {showClear && selectedValue ? (
            <TouchableOpacity onPress={() => onSelect(0)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#71717A" />
            </TouchableOpacity>
          ) : null}
          <Ionicons name="chevron-down" size={18} color="#A1A1AA" />
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    item.value === selectedValue && styles.listItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      item.value === selectedValue &&
                        styles.listItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: "#D4D4D8",
  },
  trigger: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  triggerText: {
    fontSize: 16,
    color: "#F4F4F4",
  },
  triggerPlaceholder: {
    color: "#71717A",
  },
  triggerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "60%",
    backgroundColor: "#2E2E2E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F4F4F4",
    textAlign: "center",
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  listItemSelected: {
    backgroundColor: "#3a3a3a",
  },
  listItemText: {
    fontSize: 16,
    color: "#F4F4F4",
  },
  listItemTextSelected: {
    color: "#d08000",
  },
});
