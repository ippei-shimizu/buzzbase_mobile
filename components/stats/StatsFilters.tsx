import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

interface StatsFiltersProps {
  filters: StatsFiltersType;
  onFiltersChange: (filters: StatsFiltersType) => void;
  availableYears: number[];
  availableSeasons?: { id: string; name: string }[];
  availableTournaments?: { id: string; name: string }[];
}

const MATCH_TYPE_OPTIONS = [
  { key: "公式戦", label: "公式戦" },
  { key: "オープン戦", label: "オープン戦" },
];

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string | undefined;
  options: { key: string; label: string }[];
  onSelect: (key: string | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const selectedLabel = options.find((o) => o.key === value)?.label ?? "全て";

  return (
    <View style={{ zIndex: isOpen ? 100 : 0 }}>
      <TouchableOpacity style={styles.button} onPress={onToggle}>
        <Text style={styles.buttonText}>
          {label}: {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
      </TouchableOpacity>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={styles.overlayBg} />
          </TouchableWithoutFeedback>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={[styles.dropdownItem, !value && styles.dropdownItemActive]}
              onPress={() => {
                onSelect(undefined);
                onToggle();
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !value && styles.dropdownTextActive,
                ]}
              >
                全て
              </Text>
            </TouchableOpacity>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.dropdownItem,
                  value === opt.key && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(opt.key);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    value === opt.key && styles.dropdownTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export const StatsFilters = ({
  filters,
  onFiltersChange,
  availableYears,
  availableSeasons = [],
  availableTournaments = [],
}: StatsFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const toggleFilter = (id: string) =>
    setActiveFilter((prev) => (prev === id ? null : id));

  const yearOptions = [
    { key: "all", label: "通算" },
    ...availableYears.map((y) => ({ key: String(y), label: `${y}` })),
  ];

  const seasonOptions = availableSeasons.map((s) => ({
    key: s.id,
    label: s.name,
  }));

  const tournamentOptions = availableTournaments.map((t) => ({
    key: t.id,
    label: t.name,
  }));

  return (
    <View style={styles.container}>
      <FilterDropdown
        label="年度"
        value={filters.year}
        options={yearOptions}
        onSelect={(v) =>
          onFiltersChange({ ...filters, year: v === "all" ? undefined : v })
        }
        isOpen={activeFilter === "year"}
        onToggle={() => toggleFilter("year")}
      />
      <FilterDropdown
        label="種別"
        value={filters.matchType}
        options={MATCH_TYPE_OPTIONS}
        onSelect={(v) => onFiltersChange({ ...filters, matchType: v })}
        isOpen={activeFilter === "matchType"}
        onToggle={() => toggleFilter("matchType")}
      />
      {seasonOptions.length > 0 && (
        <FilterDropdown
          label="シーズン"
          value={filters.seasonId}
          options={seasonOptions}
          onSelect={(v) => onFiltersChange({ ...filters, seasonId: v })}
          isOpen={activeFilter === "seasonId"}
          onToggle={() => toggleFilter("seasonId")}
        />
      )}
      {tournamentOptions.length > 0 && (
        <FilterDropdown
          label="大会"
          value={filters.tournamentId}
          options={tournamentOptions}
          onSelect={(v) => onFiltersChange({ ...filters, tournamentId: v })}
          isOpen={activeFilter === "tournamentId"}
          onToggle={() => toggleFilter("tournamentId")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    paddingVertical: 12,
  },
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
