import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";

interface SelectOption {
  id: number;
  label: string;
}

interface Props {
  options: SelectOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  placeholder?: string;
  style?: object;
}

export function Select({
  options,
  selectedId,
  onSelect,
  placeholder = "選択",
  style,
}: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    options.find((o) => o.id === selectedId)?.label ?? placeholder;

  return (
    <>
      <TouchableOpacity
        style={[
          {
            borderBottomWidth: 1,
            borderBottomColor: "#71717A",
            paddingVertical: 8,
            paddingHorizontal: 4,
          },
          style,
        ]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            color: selectedId !== null && selectedId !== 0 ? "#F4F4F4" : "#71717A",
            fontSize: 14,
          }}
        >
          {selectedLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              backgroundColor: "#3a3a3a",
              borderRadius: 12,
              width: "80%",
              maxHeight: "60%",
              overflow: "hidden",
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    backgroundColor:
                      item.id === selectedId ? "#52525B" : "transparent",
                  }}
                  onPress={() => {
                    onSelect(item.id);
                    setVisible(false);
                  }}
                >
                  <Text style={{ color: "#F4F4F4", fontSize: 16 }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View
                  style={{ height: 1, backgroundColor: "#52525B" }}
                />
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
