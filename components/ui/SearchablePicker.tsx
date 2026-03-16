import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";

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

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 4, fontSize: 14, color: "#D4D4D8" }}>
        {label}
      </Text>
      <TouchableOpacity
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#52525B",
          backgroundColor: "#424242",
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onPress={handleOpen}
      >
        <Text
          style={{
            fontSize: 16,
            color: value ? "#F4F4F4" : "#71717A",
          }}
        >
          {value || placeholder}
        </Text>
        <Text style={{ color: "#A1A1AA" }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
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
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#F4F4F4",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              {label}
            </Text>
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <TextInput
                style={{
                  backgroundColor: "#424242",
                  borderRadius: 8,
                  padding: 12,
                  color: "#F4F4F4",
                  fontSize: 16,
                }}
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
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                  }}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={{ fontSize: 16, color: "#F4F4F4" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.trim() ? (
                  <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
                    <Text style={{ color: "#A1A1AA", fontSize: 14 }}>
                      該当するチームがありません
                    </Text>
                  </View>
                ) : null
              }
            />
            {searchText.trim() && (
              <TouchableOpacity
                style={{
                  marginHorizontal: 16,
                  marginTop: 8,
                  backgroundColor: "#d08000",
                  borderRadius: 8,
                  padding: 14,
                  alignItems: "center",
                }}
                onPress={handleConfirmCustom}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                >
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
