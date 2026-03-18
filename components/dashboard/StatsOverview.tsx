import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BattingStats, PitchingStats } from "../../types/dashboard";
import type { StatsFilters } from "../../types/profile";
import {
  normalizeBattingStats,
  normalizePitchingStats,
} from "@utils/radarChartUtils";
import { useProfileStats } from "@hooks/useProfileStats";
import { useMySeasons } from "@hooks/useSeasons";
import { StatsRadarChart } from "./StatsRadarChart";
import { EmptyState } from "./EmptyState";

interface StatsOverviewProps {
  battingStats: BattingStats;
  pitchingStats: PitchingStats;
  style?: ViewStyle;
}

function formatStat(value: number | undefined | null, decimals = 3): string {
  if (value == null) return "-";
  return value.toFixed(decimals);
}

function StatsTable({
  rows,
}: {
  rows: [string, string | number, string, string | number][];
}) {
  return (
    <View style={styles.table}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}
        >
          <Text style={styles.cellLabel}>{row[0]}</Text>
          <Text style={styles.cellValue}>{row[1]}</Text>
          <Text style={styles.cellLabel}>{row[2]}</Text>
          <Text style={styles.cellValue}>{row[3]}</Text>
        </View>
      ))}
    </View>
  );
}

// --- FilterDropdown ---

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
      <TouchableOpacity style={filterStyles.button} onPress={onToggle}>
        <Text style={filterStyles.buttonText}>
          {label}: {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
      </TouchableOpacity>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={filterStyles.overlayBg} />
          </TouchableWithoutFeedback>
          <View style={filterStyles.dropdown}>
            <TouchableOpacity
              style={[
                filterStyles.dropdownItem,
                !value && filterStyles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(undefined);
                onToggle();
              }}
            >
              <Text
                style={[
                  filterStyles.dropdownText,
                  !value && filterStyles.dropdownTextActive,
                ]}
              >
                全て
              </Text>
            </TouchableOpacity>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  filterStyles.dropdownItem,
                  value === opt.key && filterStyles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(opt.key);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    filterStyles.dropdownText,
                    value === opt.key && filterStyles.dropdownTextActive,
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

const MATCH_TYPE_OPTIONS = [
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

// --- Sections ---

const BattingSection = ({
  stats,
  filterBar,
}: {
  stats: BattingStats;
  filterBar: React.ReactNode;
}) => {
  const radarData = normalizeBattingStats(stats);
  const { aggregate: agg, calculated: calc } = stats;

  if (!agg || !calc) {
    return <EmptyState title="打撃データがありません" />;
  }

  return (
    <>
      {radarData.length > 0 && (
        <StatsRadarChart data={radarData} color="#d08000" title="打撃" />
      )}

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>打撃成績</Text>
        {filterBar}
      </View>

      <View style={styles.headline}>
        <Text style={styles.headlineRow}>
          <Text style={styles.headlineLabel}>打率 </Text>
          <Text style={styles.headlineValue}>
            {formatStat(calc.batting_average)}
          </Text>
          <Text style={styles.headlineSub}>
            {"  "}
            {agg.number_of_matches}試合
          </Text>
        </Text>
        <Text style={styles.headlineSummary}>
          {agg.times_at_bat}打席 {agg.at_bats}打数 {agg.hit}安打 /{" "}
          {agg.runs_batted_in}打点 {agg.home_run}本塁打
        </Text>
      </View>

      <StatsTable
        rows={[
          [
            "打率",
            formatStat(calc.batting_average),
            "試合",
            agg.number_of_matches ?? "-",
          ],
          ["打席", agg.times_at_bat ?? "-", "打数", agg.at_bats ?? "-"],
          ["安打", agg.hit ?? "-", "二塁打", agg.two_base_hit ?? "-"],
          ["三塁打", agg.three_base_hit ?? "-", "本塁打", agg.home_run ?? "-"],
          ["塁打", agg.total_bases ?? "-", "打点", agg.runs_batted_in ?? "-"],
          ["得点", agg.run ?? "-", "三振", agg.strike_out ?? "-"],
          ["四球", agg.base_on_balls ?? "-", "死球", agg.hit_by_pitch ?? "-"],
          ["犠打", agg.sacrifice_hit ?? "-", "犠飛", agg.sacrifice_fly ?? "-"],
          [
            "盗塁",
            agg.stealing_base ?? "-",
            "盗塁死",
            agg.caught_stealing ?? "-",
          ],
          [
            "出塁率",
            formatStat(calc.on_base_percentage),
            "長打率",
            formatStat(calc.slugging_percentage),
          ],
          ["OPS", formatStat(calc.ops), "ISO", formatStat(calc.iso)],
          ["ISOD", formatStat(calc.isod), "BB/K", formatStat(calc.bb_per_k)],
        ]}
      />
    </>
  );
};

const PitchingSection = ({
  stats,
  filterBar,
}: {
  stats: PitchingStats;
  filterBar: React.ReactNode;
}) => {
  const radarData = normalizePitchingStats(stats);
  const { aggregate: pAgg, calculated: pCalc } = stats;

  if (!pAgg || !pCalc) {
    return <EmptyState title="投手データがありません" />;
  }

  return (
    <>
      {radarData.length > 0 && (
        <StatsRadarChart data={radarData} color="#338EF7" title="投手" />
      )}

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>投手成績</Text>
        {filterBar}
      </View>

      <View style={styles.headline}>
        <Text style={styles.headlineRow}>
          <Text style={styles.headlineLabel}>防御率 </Text>
          <Text style={styles.headlineValue}>{formatStat(pCalc.era, 2)}</Text>
          <Text style={styles.headlineSub}>
            {"  "}
            {pAgg.number_of_appearances}登板
          </Text>
        </Text>
        <Text style={styles.headlineSummary}>
          {pAgg.win}勝 {pAgg.loss}敗 / {pAgg.innings_pitched}回{" "}
          {pAgg.strikeouts}奪三振
        </Text>
      </View>

      <StatsTable
        rows={[
          [
            "防御率",
            formatStat(pCalc.era, 2),
            "登板",
            pAgg.number_of_appearances ?? "-",
          ],
          ["勝", pAgg.win ?? "-", "敗", pAgg.loss ?? "-"],
          [
            "投球回",
            pAgg.innings_pitched ?? "-",
            "完投",
            pAgg.complete_games ?? "-",
          ],
          ["完封", pAgg.shutouts ?? "-", "セーブ", pAgg.saves ?? "-"],
          ["ホールド", pAgg.hold ?? "-", "奪三振", pAgg.strikeouts ?? "-"],
          [
            "与四球",
            pAgg.base_on_balls ?? "-",
            "与死球",
            pAgg.hit_by_pitch ?? "-",
          ],
          [
            "被安打",
            pAgg.hits_allowed ?? "-",
            "被本塁打",
            pAgg.home_runs_hit ?? "-",
          ],
          ["失点", pAgg.run_allowed ?? "-", "自責点", pAgg.earned_run ?? "-"],
          [
            "勝率",
            formatStat(pCalc.win_percentage),
            "WHIP",
            formatStat(pCalc.whip, 2),
          ],
          [
            "K/9",
            formatStat(pCalc.k_per_nine, 2),
            "BB/9",
            formatStat(pCalc.bb_per_nine, 2),
          ],
          ["K/BB", formatStat(pCalc.k_bb, 2), "", ""],
        ]}
      />
    </>
  );
};

// --- Main ---

export const StatsOverview = ({
  battingStats: defaultBatting,
  pitchingStats: defaultPitching,
  style,
}: StatsOverviewProps) => {
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined,
  );
  const [selectedMatchType, setSelectedMatchType] = useState<
    string | undefined
  >(undefined);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    undefined,
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const toggleFilter = (id: string) =>
    setActiveFilter((prev) => (prev === id ? null : id));

  const hasFilters = !!(selectedYear || selectedMatchType || selectedSeasonId);

  const filters: StatsFilters = {
    ...(selectedYear ? { year: selectedYear } : {}),
    ...(selectedMatchType ? { matchType: selectedMatchType } : {}),
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
  };

  const { battingStats: filteredBatting, pitchingStats: filteredPitching } =
    useProfileStats(filters);

  const { seasons } = useMySeasons();

  const battingStats =
    hasFilters && filteredBatting ? filteredBatting : defaultBatting;
  const pitchingStats =
    hasFilters && filteredPitching ? filteredPitching : defaultPitching;

  const filterBar = (
    <View style={styles.filterRow}>
      <FilterDropdown
        label="年度"
        value={selectedYear}
        options={[
          { key: "all", label: "通算" },
          ...Array.from({ length: 5 }, (_, i) => {
            const y = String(new Date().getFullYear() - i);
            return { key: y, label: y };
          }),
        ]}
        onSelect={(v) => setSelectedYear(v === "all" ? undefined : v)}
        isOpen={activeFilter === "year"}
        onToggle={() => toggleFilter("year")}
      />
      <FilterDropdown
        label="種別"
        value={selectedMatchType}
        options={MATCH_TYPE_OPTIONS}
        onSelect={setSelectedMatchType}
        isOpen={activeFilter === "matchType"}
        onToggle={() => toggleFilter("matchType")}
      />
      <FilterDropdown
        label="シーズン"
        value={selectedSeasonId}
        options={seasons.map((s) => ({
          key: String(s.id),
          label: s.name,
        }))}
        onSelect={setSelectedSeasonId}
        isOpen={activeFilter === "season"}
        onToggle={() => toggleFilter("season")}
      />
    </View>
  );

  return (
    <View style={style}>
      <View style={styles.sectionCard}>
        <BattingSection stats={battingStats} filterBar={filterBar} />
      </View>
      <View style={styles.sectionCard}>
        <PitchingSection stats={pitchingStats} filterBar={filterBar} />
      </View>
    </View>
  );
};

// --- Styles ---

const filterStyles = StyleSheet.create({
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
    position: "absolute" as never,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d08000",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  headline: {
    marginBottom: 16,
  },
  headlineRow: {
    marginBottom: 4,
  },
  headlineLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  headlineValue: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  headlineSub: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  headlineSummary: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowEven: {},
  cellLabel: {
    flex: 1,
    color: "#A1A1AA",
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#27272a",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
  cellValue: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "center",
    backgroundColor: "#424242",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
});
