import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import type { StatsPeriod } from "../../types/stats";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { PeriodToggle } from "@components/stats/PeriodToggle";
import { PlateAppearanceDonut } from "@components/stats/PlateAppearanceDonut";
import { SprayChart } from "@components/stats/SprayChart";
import { StatsFilters } from "@components/stats/StatsFilters";
import {
  StatsTable,
  BATTING_COLUMNS,
  PITCHING_COLUMNS,
} from "@components/stats/StatsTable";
import {
  useHitDirections,
  usePlateAppearanceBreakdown,
  useBattingStatsTable,
  usePitchingStatsTable,
} from "@hooks/useStats";

type ActiveTab = "batting" | "pitching";

const currentYear = new Date().getFullYear().toString();

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("batting");
  const [filters, setFilters] = useState<StatsFiltersType>({});
  const [battingPeriod, setBattingPeriod] = useState<StatsPeriod>("yearly");
  const [pitchingPeriod, setPitchingPeriod] = useState<StatsPeriod>("yearly");
  const [tableYear, setTableYear] = useState<string | undefined>(undefined);

  const hitDirections = useHitDirections(filters);
  const paBreakdown = usePlateAppearanceBreakdown(filters);
  const battingTable = useBattingStatsTable(battingPeriod, tableYear);
  const pitchingTable = usePitchingStatsTable(pitchingPeriod, tableYear);
  const isLoading =
    hitDirections.isLoading ||
    paBreakdown.isLoading ||
    battingTable.isLoading ||
    pitchingTable.isLoading;

  const isRefreshing =
    hitDirections.isFetching ||
    paBreakdown.isFetching ||
    battingTable.isFetching ||
    pitchingTable.isFetching;

  const onRefresh = useCallback(() => {
    hitDirections.refetch();
    paBreakdown.refetch();
    battingTable.refetch();
    pitchingTable.refetch();
  }, [hitDirections, paBreakdown, battingTable, pitchingTable]);

  const handleBattingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setBattingPeriod(period);
      if (period !== "yearly" && tableYear === undefined) {
        setTableYear(currentYear);
      }
    },
    [tableYear],
  );

  const handlePitchingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setPitchingPeriod(period);
      if (period !== "yearly" && tableYear === undefined) {
        setTableYear(currentYear);
      }
    },
    [tableYear],
  );

  // TODO: replace with real available years from API
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#f59e0b"
        />
      }
    >
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "batting" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("batting")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "batting" && styles.tabTextActive,
            ]}
          >
            打撃
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "pitching" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("pitching")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pitching" && styles.tabTextActive,
            ]}
          >
            投球
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <StatsFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableYears={availableYears}
      />

      {/* Batting Tab */}
      {activeTab === "batting" && (
        <View>
          {hitDirections.data && <SprayChart directions={hitDirections.data} />}
          {paBreakdown.data && (
            <PlateAppearanceDonut
              breakdown={paBreakdown.data}
              totalPlateAppearances={paBreakdown.data.reduce(
                (sum, c) => sum + c.count,
                0,
              )}
            />
          )}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderLabel}>打撃成績</Text>
            <PeriodToggle
              value={battingPeriod}
              onChange={handleBattingPeriodChange}
            />
          </View>
          {battingTable.data && (
            <StatsTable
              rows={battingTable.data}
              columns={BATTING_COLUMNS}
              labelKey="label"
            />
          )}
        </View>
      )}

      {/* Pitching Tab */}
      {activeTab === "pitching" && (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderLabel}>投球成績</Text>
            <PeriodToggle
              value={pitchingPeriod}
              onChange={handlePitchingPeriodChange}
            />
          </View>
          {pitchingTable.data && (
            <StatsTable
              rows={pitchingTable.data}
              columns={PITCHING_COLUMNS}
              labelKey="label"
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#222",
  },
  tabButtonActive: {
    backgroundColor: "#f59e0b",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tableHeaderLabel: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
});
