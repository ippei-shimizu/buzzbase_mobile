import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
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
  value: string;
  onSelect: (value: string | number, label: string) => void;
  onCustomInput: (text: string) => void;
  placeholder?: string;
}

export function SearchablePicker({
  label,
  items,
  value,
  onSelect,
  onCustomInput,
  placeholder = "検索または入力",
}: Props) {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchText) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [items, searchText]);

  const handleOpen = () => {
    setSearchText(value);
    setVisible(true);
  };

  const handleSelect = (item: PickerItem) => {
    onSelect(item.value, item.label);
    setVisible(false);
  };

  const handleConfirmCustom = () => {
    if (searchText.trim()) {
      onCustomInput(searchText.trim());
    }
    setVisible(false);
  };

  const handleClear = () => {
    onCustomInput("");
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.trigger} onPress={handleOpen}>
        <Text
          style={[styles.triggerText, !value && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <View style={styles.triggerActions}>
          {value ? (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
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
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="チーム名を入力"
                placeholderTextColor="#71717A"
                autoFocus
              />
            </View>
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.listItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.trim() ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      該当するチームがありません
                    </Text>
                  </View>
                ) : null
              }
            />
            {searchText.trim() && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmCustom}
              >
                <Text style={styles.confirmButtonText}>
                  「{searchText.trim()}」で決定
                </Text>
              </TouchableOpacity>
            )}
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
    flex: 1,
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
    maxHeight: "70%",
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#424242",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 16,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  listItemText: {
    fontSize: 16,
    color: "#F4F4F4",
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  confirmButton: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
