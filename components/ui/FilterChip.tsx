import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  Modal,
  View,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterChipProps {
  label: string;
  value: string;
  defaultValue: string;
  options: FilterOption[];
  onChange: (key: string) => void;
}

export const FilterChip = ({
  label,
  value,
  defaultValue,
  options,
  onChange,
}: FilterChipProps) => {
  const [visible, setVisible] = useState(false);
  const isFiltered = value !== defaultValue;
  const displayValue = options.find((opt) => opt.key === value)?.label ?? value;
  const chipRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleOpen = () => {
    chipRef.current?.measureInWindow(
      (x: number, y: number, _width: number, height: number) => {
        setDropdownPosition({ top: y + height + 4, left: x });
        setVisible(true);
      },
    );
  };

  return (
    <>
      <View ref={chipRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.chip, isFiltered && styles.chipActive]}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, isFiltered && styles.chipTextActive]}>
            {label}: {displayValue}
          </Text>
          <Text style={[styles.chevron, isFiltered && styles.chipTextActive]}>
            ▾
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.dropdown,
              { top: dropdownPosition.top, left: dropdownPosition.left },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.key === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.key);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.key === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#52525b",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  chipActive: {
    borderColor: "rgba(208, 128, 0, 0.4)",
  },
  chipText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#d08000",
  },
  chevron: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#3f3f46",
    borderRadius: 8,
    minWidth: 140,
    maxHeight: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: "rgba(208, 128, 0, 0.15)",
  },
  optionText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#d08000",
    fontWeight: "600",
  },
});
