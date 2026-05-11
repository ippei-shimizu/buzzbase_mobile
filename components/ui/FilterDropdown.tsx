import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

interface FilterDropdownProps {
  label: string;
  value: string | undefined;
  options: { key: string; label: string }[];
  onSelect: (key: string | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// 角丸のピル型ボタン共通スタイル。FilterDropdown のトリガーだけでなく、
// ソート切替ボタン等の汎用的なピル型ボタンとして再利用できるよう外出ししている。
export const pillButtonStyle = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "500",
  },
});

const dropdownStyles = StyleSheet.create({
  overlayBg: {
    position: "absolute" as const,
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
    zIndex: 99,
  },
  dropdown: {
    position: "absolute",
    top: 36,
    left: 0,
    zIndex: 100,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: "#4A4A4A",
  },
  dropdownText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  dropdownTextActive: {
    color: "#d08000",
  },
});

export function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: FilterDropdownProps) {
  const selectedLabel = options.find((o) => o.key === value)?.label ?? "全て";

  return (
    <View style={{ zIndex: isOpen ? 100 : 0 }}>
      <TouchableOpacity style={pillButtonStyle.button} onPress={onToggle}>
        <Text style={pillButtonStyle.buttonText}>
          {label}: {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
      </TouchableOpacity>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={dropdownStyles.overlayBg} />
          </TouchableWithoutFeedback>
          <View style={dropdownStyles.dropdown}>
            <ScrollView
              style={dropdownStyles.dropdownScroll}
              nestedScrollEnabled
            >
              <TouchableOpacity
                style={[
                  dropdownStyles.dropdownItem,
                  !value && dropdownStyles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(undefined);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    dropdownStyles.dropdownText,
                    !value && dropdownStyles.dropdownTextActive,
                  ]}
                >
                  全て
                </Text>
              </TouchableOpacity>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    dropdownStyles.dropdownItem,
                    value === opt.key && dropdownStyles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onSelect(opt.key);
                    onToggle();
                  }}
                >
                  <Text
                    style={[
                      dropdownStyles.dropdownText,
                      value === opt.key && dropdownStyles.dropdownTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

export { MATCH_TYPE_OPTIONS } from "@utils/matchType";
