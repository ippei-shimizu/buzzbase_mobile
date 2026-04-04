import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

interface StatsFiltersProps {
  filters: StatsFiltersType;
  onFiltersChange: (filters: StatsFiltersType) => void;
  availableYears: number[];
  availableSeasons?: { id: string; name: string }[];
}

type FilterKey = "year" | "matchType" | "seasonId";

const MATCH_TYPES = [
  { value: undefined, label: "全て" },
  { value: "公式戦", label: "公式戦" },
  { value: "オープン戦", label: "オープン戦" },
];

export const StatsFilters = ({
  filters,
  onFiltersChange,
  availableYears,
  availableSeasons = [],
}: StatsFiltersProps) => {
  const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null);

  const yearOptions = [
    { value: undefined, label: "通算" },
    ...availableYears.map((y) => ({ value: String(y), label: `${y}年` })),
  ];

  const seasonOptions = [
    { value: undefined, label: "全シーズン" },
    ...availableSeasons.map((s) => ({ value: s.id, label: s.name })),
  ];

  const getDisplayLabel = (key: FilterKey): string => {
    switch (key) {
      case "year":
        return filters.year ? `${filters.year}年` : "通算";
      case "matchType":
        return filters.matchType || "全て";
      case "seasonId": {
        const season = availableSeasons.find((s) => s.id === filters.seasonId);
        return season?.name || "シーズン";
      }
    }
  };

  const getOptions = (key: FilterKey) => {
    switch (key) {
      case "year":
        return yearOptions;
      case "matchType":
        return MATCH_TYPES;
      case "seasonId":
        return seasonOptions;
    }
  };

  const handleSelect = (key: FilterKey, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
    setActiveDropdown(null);
  };

  const filterKeys: FilterKey[] = ["year", "matchType", "seasonId"];

  return (
    <View style={styles.container}>
      {filterKeys.map((key) => (
        <TouchableOpacity
          key={key}
          style={styles.filterButton}
          onPress={() => setActiveDropdown(activeDropdown === key ? null : key)}
        >
          <Text style={styles.filterText}>{getDisplayLabel(key)} ▼</Text>
        </TouchableOpacity>
      ))}

      {activeDropdown && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setActiveDropdown(null)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          >
            <View style={styles.dropdown}>
              <FlatList
                data={getOptions(activeDropdown)}
                keyExtractor={(item) => item.value ?? "none"}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(activeDropdown, item.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        filters[activeDropdown] === item.value &&
                          styles.dropdownTextActive,
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 6, paddingVertical: 8 },
  filterButton: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  filterText: { color: "#aaa", fontSize: 11 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#222",
    borderRadius: 12,
    width: 200,
    maxHeight: 300,
    padding: 8,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownText: { color: "#ccc", fontSize: 14 },
  dropdownTextActive: { color: "#f59e0b", fontWeight: "700" },
});
