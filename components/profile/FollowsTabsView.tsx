import type { FollowingUser } from "../../types/group";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UserRow } from "@components/profile/UserRow";
import { SwipeableTabPages } from "@components/ui/SwipeableTabPages";
import { useFollowingUsers } from "@hooks/useGroups";
import { useProfile } from "@hooks/useProfile";
import {
  useFollowersUsers,
  useFollowUser,
  useUnfollowUser,
} from "@hooks/useRelationship";

export type FollowTab = "following" | "followers";

const TABS: { key: FollowTab; label: string; emptyMessage: string }[] = [
  {
    key: "following",
    label: "フォロー中",
    emptyMessage: "フォロー中のユーザーはいません",
  },
  {
    key: "followers",
    label: "フォロワー",
    emptyMessage: "フォロワーはいません",
  },
];
const TAB_KEYS = TABS.map((item) => item.key);

interface FollowUserListProps {
  users: FollowingUser[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  selfId: number | undefined;
  onUserPress: (userId: string) => void;
  onFollowPress: (userId: number) => void;
}

function FollowUserList({
  users,
  isLoading,
  isError,
  emptyMessage,
  selfId,
  onUserPress,
  onFollowPress,
}: FollowUserListProps) {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>データの取得に失敗しました</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={users}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <UserRow
          user={item}
          onPress={onUserPress}
          showFollowButton
          isSelf={item.id === selfId}
          onFollowPress={onFollowPress}
        />
      )}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

interface FollowsTabsViewProps {
  /** 一覧を表示する対象ユーザー。未指定なら取得しない。 */
  userId: number | undefined;
  initialTab: FollowTab;
  /** 行をタップしたときの遷移先。プロフィール配下と通知配下で異なる。 */
  onUserPress: (userId: string) => void;
}

/** フォロー中とフォロワーをタブと横スワイプで切り替える一覧。 */
export function FollowsTabsView({
  userId,
  initialTab,
  onUserPress,
}: FollowsTabsViewProps) {
  const { profile } = useProfile();
  const { followUser } = useFollowUser();
  const { unfollowUser } = useUnfollowUser();
  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);

  const {
    users: followingUsers,
    isLoading: isFollowingLoading,
    isError: isFollowingError,
  } = useFollowingUsers(userId);

  const {
    users: followersUsers,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
  } = useFollowersUsers(userId);

  // 同じユーザーが両方の一覧に居るとき、面ごとのフォロー状態で判定させる。
  const createFollowPressHandler =
    (users: FollowingUser[]) => async (targetUserId: number) => {
      const target = users.find((user) => user.id === targetUserId);
      if (!target) return;
      if (target.isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
    };

  const renderPage = (key: FollowTab) => {
    const isFollowingTab = key === "following";
    const users = isFollowingTab ? followingUsers : followersUsers;
    const tab = TABS.find((item) => item.key === key);
    return (
      <FollowUserList
        users={users}
        isLoading={isFollowingTab ? isFollowingLoading : isFollowersLoading}
        isError={isFollowingTab ? isFollowingError : isFollowersError}
        emptyMessage={tab?.emptyMessage ?? ""}
        selfId={profile?.id}
        onUserPress={onUserPress}
        onFollowPress={createFollowPressHandler(users)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SwipeableTabPages
        tabKeys={TAB_KEYS}
        activeKey={activeTab}
        onChange={setActiveTab}
        renderPage={renderPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  // FlatList は境界サイズが無いと可視ウィンドウを計算できず仮想化が効かないため明示する。
  list: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#d08000",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});
