import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";

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
}

export function SelectPicker({
  label,
  items,
  selectedValue,
  onSelect,
  placeholder = "選択してください",
}: Props) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = items.find((i) => i.value === selectedValue)?.label;

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
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            fontSize: 16,
            color: selectedLabel ? "#F4F4F4" : "#71717A",
          }}
        >
          {selectedLabel || placeholder}
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
              maxHeight: "60%",
              backgroundColor: "#2E2E2E",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingTop: 16,
              paddingBottom: 32,
            }}
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
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    backgroundColor:
                      item.value === selectedValue ? "#3a3a3a" : "transparent",
                  }}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        item.value === selectedValue ? "#d08000" : "#F4F4F4",
                    }}
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
