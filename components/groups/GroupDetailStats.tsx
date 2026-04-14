import type { GroupDetail, GroupUser } from "../../types/group";
import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { StatsFilters } from "@components/stats/StatsFilters";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";
import { formatRate, formatEra } from "@utils/formatStats";

interface GroupDetailStatsProps {
  detail: GroupDetail;
  selectedYear: string;
  selectedMatchType: string;
  selectedTournamentId?: string;
  availableYears: number[];
  availableTournaments?: { id: number; name: string }[];
  onYearChange: (year: string) => void;
  onMatchTypeChange: (matchType: string) => void;
  onTournamentChange: (tournamentId: string | undefined) => void;
}

interface Category {
  key: string;
  label: string;
  source: string;
  decimals: number;
  inverse?: boolean;
}

const BATTING_CATEGORIES: Category[] = [
  { key: "batting_average", label: "打率", source: "stat", decimals: 3 },
  { key: "home_run", label: "本塁打", source: "avg", decimals: 0 },
  { key: "runs_batted_in", label: "打点", source: "avg", decimals: 0 },
  { key: "hit", label: "安打", source: "avg", decimals: 0 },
  { key: "stealing_base", label: "盗塁", source: "avg", decimals: 0 },
  { key: "on_base_percentage", label: "出塁率", source: "stat", decimals: 3 },
];

const PITCHING_CATEGORIES: Category[] = [
  { key: "era", label: "防御率", source: "stat", decimals: 2, inverse: true },
  { key: "win", label: "勝利", source: "agg", decimals: 0 },
  { key: "saves", label: "セーブ", source: "agg", decimals: 0 },
  { key: "hold", label: "HP", source: "agg", decimals: 0 },
  { key: "strikeouts", label: "奪三振", source: "agg", decimals: 0 },
  { key: "win_percentage", label: "勝率", source: "stat", decimals: 3 },
];

interface RankedUser {
  user: GroupUser;
  value: number | null;
}

function findUserData(
  dataArrays: Record<string, number | string | null>[],
  userId: string | number,
): Record<string, number | string | null> | undefined {
  return dataArrays.find(
    (d) =>
      d &&
      (String(d.user_id) === String(userId) || String(d.id) === String(userId)),
  );
}

function buildRanking(
  users: GroupUser[],
  dataArrays: Record<string, number | string | null>[],
  key: string,
  inverse = false,
): RankedUser[] {
  const ranked = users.map((user) => {
    const data = findUserData(dataArrays, user.id);
    const raw = data?.[key];
    return {
      user,
      value: typeof raw === "number" ? raw : null,
    };
  });
  return ranked
    .filter((r) => r.value !== null)
    .sort((a, b) =>
      inverse
        ? (a.value ?? 0) - (b.value ?? 0)
        : (b.value ?? 0) - (a.value ?? 0),
    );
}

function formatValue(value: number | null, decimals: number): string {
  if (value === null) return "-";
  if (decimals === 0) return String(value);
  if (decimals === 3) return formatRate(value);
  if (decimals === 2) return formatEra(value);
  return value.toFixed(decimals);
}

const RankingRow = ({
  rank,
  user,
  value,
  decimals,
}: {
  rank: number;
  user: GroupUser;
  value: number | null;
  decimals: number;
}) => {
  const hasValidImage =
    user.image?.url &&
    !user.image.url.endsWith(".svg") &&
    user.image.url.length > 0;

  return (
    <View style={styles.rankingRow}>
      <Text style={styles.rankNumber}>{rank}</Text>
      {hasValidImage ? (
        <Image
          source={{
            uri: user.image!.url!.startsWith("http")
              ? user.image!.url!
              : `${API_BASE_URL}${user.image!.url!}`,
          }}
          style={styles.avatar}
        />
      ) : (
        <DefaultUserIcon size={40} />
      )}
      <View style={styles.rankingInfo}>
        <Text style={styles.rankingName} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.rankingUserId}>{user.user_id}</Text>
      </View>
      <Text style={styles.rankingValue}>{formatValue(value, decimals)}</Text>
    </View>
  );
};

export const GroupDetailStats = ({
  detail,
  selectedYear,
  selectedMatchType,
  selectedTournamentId,
  availableYears,
  availableTournaments = [],
  onYearChange,
  onMatchTypeChange,
  onTournamentChange,
}: GroupDetailStatsProps) => {
  const [activeTab, setActiveTab] = useState<"batting" | "pitching">("batting");
  const [selectedCategory, setSelectedCategory] = useState(0);

  // StatsFiltersは日本語キー("公式戦"/"オープン戦")を使うが、
  // グループAPIはDB値("regular"/"open")を期待するため変換する
  const matchTypeToJa: Record<string, string> = {
    regular: "公式戦",
    open: "オープン戦",
  };
  const matchTypeToEn: Record<string, string> = {
    公式戦: "regular",
    オープン戦: "open",
  };

  const filters: StatsFiltersType = {
    year: selectedYear === "通算" ? undefined : selectedYear,
    matchType:
      selectedMatchType === "全て"
        ? undefined
        : (matchTypeToJa[selectedMatchType] ?? selectedMatchType),
    tournamentId: selectedTournamentId,
  };

  const handleFiltersChange = (newFilters: StatsFiltersType) => {
    onYearChange(newFilters.year ?? "通算");
    const mt = newFilters.matchType;
    onMatchTypeChange(mt ? (matchTypeToEn[mt] ?? mt) : "全て");
    onTournamentChange(newFilters.tournamentId);
  };

  const categories =
    activeTab === "batting" ? BATTING_CATEGORIES : PITCHING_CATEGORIES;
  const category = categories[selectedCategory];

  const getDataSource = (): Record<string, number | string | null>[] => {
    if (activeTab === "batting") {
      const src =
        category.source === "avg"
          ? detail.batting_averages
          : detail.batting_stats;
      return (Array.isArray(src) ? src : []).flat().filter(Boolean);
    }
    const src =
      category.source === "agg"
        ? detail.pitching_aggregate
        : detail.pitching_stats;
    return (Array.isArray(src) ? src : []).flat().filter(Boolean);
  };

  const ranking = buildRanking(
    detail.accepted_users,
    getDataSource(),
    category.key,
    category.inverse,
  );

  const handleTabChange = (tab: "batting" | "pitching") => {
    setActiveTab(tab);
    setSelectedCategory(0);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>個人成績ランキング</Text>

      {/* Filters */}
      <StatsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableYears={availableYears}
        availableTournaments={availableTournaments.map((t) => ({
          id: String(t.id),
          name: t.name,
        }))}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "batting" && styles.tabActive]}
          onPress={() => handleTabChange("batting")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "batting" && styles.tabTextActive,
            ]}
          >
            打撃成績
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pitching" && styles.tabActive]}
          onPress={() => handleTabChange("pitching")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pitching" && styles.tabTextActive,
            ]}
          >
            投手成績
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <View style={styles.pillContainer}>
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.pill, selectedCategory === i && styles.pillActive]}
            onPress={() => setSelectedCategory(i)}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === i && styles.pillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ranking list */}
      <View style={styles.rankingCard}>
        <Text style={styles.rankingHeader}>{category.label}</Text>
        {ranking.length === 0 ? (
          <Text style={styles.emptyText}>データがありません</Text>
        ) : (
          ranking.map((item, i) => (
            <RankingRow
              key={item.user.id}
              rank={i + 1}
              user={item.user}
              value={item.value}
              decimals={category.decimals}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#27272a",
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    minWidth: "30%",
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: "rgba(208, 128, 0, 0.2)",
  },
  pillText: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#d08000",
  },
  rankingCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    overflow: "hidden",
  },
  rankingHeader: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: "#3A3A3A",
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3f46",
    gap: 12,
  },
  rankNumber: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "700",
    width: 20,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  rankingUserId: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 1,
  },
  rankingValue: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    minWidth: 50,
    textAlign: "right",
  },
  emptyText: {
    color: "#71717A",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
});
