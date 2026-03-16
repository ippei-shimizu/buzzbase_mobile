import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";

interface PickerItem {
  label: string;
  value: number;
}

interface Props {
  label: string;
  items: PickerItem[];
  selectedValues: number[];
  onSelect: (values: number[]) => void;
  placeholder?: string;
}

export function MultiSelectPicker({
  label,
  items,
  selectedValues,
  onSelect,
  placeholder = "選択してください",
}: Props) {
  const [visible, setVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<number[]>([]);

  const selectedLabels = items
    .filter((i) => selectedValues.includes(i.value))
    .map((i) => i.label)
    .join(", ");

  const handleOpen = () => {
    setTempSelected([...selectedValues]);
    setVisible(true);
  };

  const handleToggle = (value: number) => {
    setTempSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const handleDone = () => {
    onSelect(tempSelected);
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
            color: selectedLabels ? "#F4F4F4" : "#71717A",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {selectedLabels || placeholder}
        </Text>
        <Text style={{ color: "#A1A1AA", marginLeft: 8 }}>▼</Text>
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
            onStartShouldSetResponder={() => true}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#F4F4F4" }}
              >
                {label}
              </Text>
              <TouchableOpacity onPress={handleDone}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#d08000",
                  }}
                >
                  完了
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = tempSelected.includes(item.value);
                return (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: isSelected
                        ? "#3a3a3a"
                        : "transparent",
                    }}
                    onPress={() => handleToggle(item.value)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#d08000" : "#F4F4F4",
                      }}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: "#d08000", fontSize: 18 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
