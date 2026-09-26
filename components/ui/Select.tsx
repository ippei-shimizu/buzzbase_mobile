import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Icon } from "@components/icon/Icon";

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
  /**
   * 選択操作を無効化する。true のときはタップしてもモーダルが開かず、
   * 視覚的にもグレーアウトして無効状態であることを示す。
   * 用途例: 打席結果が「三振」「四球」など打球方向を伴わないケースで、
   * 打球方向の Select をユーザーに編集させたくない場合。
   */
  disabled?: boolean;
  /** 見た目。outlined は角丸の枠とシェブロン付きで、Web 版の select に合わせたもの */
  variant?: "underline" | "outlined";
  accessibilityLabel?: string;
}

const triggerStyles = {
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: "#71717A",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  outlined: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderWidth: 1,
    borderColor: "#71717A",
    borderRadius: 8,
    backgroundColor: "#27272A",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
};

export function Select({
  options,
  selectedId,
  onSelect,
  placeholder = "選択",
  style,
  disabled = false,
  variant = "underline",
  accessibilityLabel,
}: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    options.find((o) => o.id === selectedId)?.label ?? placeholder;

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={[triggerStyles[variant], { opacity: disabled ? 0.4 : 1 }, style]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            color:
              selectedId !== null && selectedId !== 0 ? "#F4F4F4" : "#71717A",
            fontSize: 14,
          }}
        >
          {selectedLabel}
        </Text>
        {variant === "outlined" ? (
          <Icon name="chevron-down" size={16} color="#A1A1AA" />
        ) : null}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setVisible(false)}
          />
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
              nestedScrollEnabled
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
                <View style={{ height: 1, backgroundColor: "#52525B" }} />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
