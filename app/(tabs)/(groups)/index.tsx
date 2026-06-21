import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { GroupListCard } from "@components/groups/GroupListCard";
import {
  GlobalMenuButton,
  GlobalMenuOverlay,
  useGlobalMenu,
} from "@components/ui/GlobalMenu";
import { useGroupJoinTooltip } from "@hooks/useGroupJoinTooltip";
import { useGroups } from "@hooks/useGroups";

export default function GroupsTabScreen() {
  const router = useRouter();
  const { groups, isLoading, refetch, isRefreshing } = useGroups();
  const { menuVisible, menuOpacity, openMenu, closeMenu } = useGlobalMenu();
  const { hasShown: tooltipHasShown, markShown: markTooltipShown } =
    useGroupJoinTooltip();
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);

  // 初回表示時にフラグを永続化し、次回起動以降は表示しない
  useEffect(() => {
    if (tooltipHasShown === false) markTooltipShown();
  }, [tooltipHasShown, markTooltipShown]);

  const showJoinTooltip = tooltipHasShown === false && !isTooltipDismissed;

  const handleGroupPress = (id: number) => {
    router.push(`/(groups)/${id}`);
  };

  const handleCreate = () => {
    router.push("/(groups)/create");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const handleJoin = () => {
    setIsTooltipDismissed(true);
    router.push("/(groups)/join");
  };

  const banner = (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>友達とグループを作成しよう！</Text>
      <Text style={styles.bannerDescription}>
        グループ機能は、フォローしているユーザーを招待して成績をランキング形式で共有することができます。
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>グループ作成</Text>
        <Ionicons name="add-circle" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const joinBanner = (
    <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
      <Ionicons name="ticket-outline" size={18} color="#d08000" />
      <Text style={styles.joinButtonText}>招待コードでグループに参加</Text>
      <Ionicons name="chevron-forward" size={16} color="#71717A" />
    </TouchableOpacity>
  );

  const joinTooltip = showJoinTooltip ? (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>
        チームメイトから招待コードをもらって参加しよう
      </Text>
      <TouchableOpacity
        onPress={() => setIsTooltipDismissed(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="ヒントを閉じる"
      >
        <Ionicons name="close" size={16} color="#A1A1AA" />
      </TouchableOpacity>
    </View>
  ) : null;

  const groupListHeader =
    groups.length > 0 ? (
      <Text style={styles.sectionTitle}>グループ</Text>
    ) : null;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <GlobalMenuButton onPress={openMenu} />,
        }}
      />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <GroupListCard group={item} onPress={handleGroupPress} />
        )}
        ListHeaderComponent={
          <>
            {banner}
            {joinBanner}
            {joinTooltip}
            {groupListHeader}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#d08000"
          />
        }
      />
      <GlobalMenuOverlay
        visible={menuVisible}
        opacity={menuOpacity}
        onClose={closeMenu}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  banner: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  bannerTitle: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  bannerDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  joinButtonText: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3a2e1a",
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: -12,
    marginBottom: 24,
  },
  tooltipText: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});
