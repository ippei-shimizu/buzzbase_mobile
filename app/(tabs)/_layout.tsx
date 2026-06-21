import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { BallIcon } from "@components/icon/BallIcon";
import { GroupTabIcon } from "@components/icon/GroupTabIcon";
import { HomeIcon } from "@components/icon/HomeIcon";
import { StatsIcon } from "@components/icon/StatsIcon";
import { UserIcon } from "@components/icon/UserIcon";
import { useAuth } from "@hooks/useAuth";
import { useGroups } from "@hooks/useGroups";
import { useGroupTabBadge } from "@hooks/useGroupTabBadge";
import { useOnboarding } from "@hooks/useOnboarding";

export default function TabLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { isCompleted: isOnboardingCompleted } = useOnboarding();
  const { groups, isLoading: isGroupsLoading } = useGroups({
    enabled: isLoggedIn === true,
  });
  const { seen: isGroupBadgeSeen, markSeen: markGroupBadgeSeen } =
    useGroupTabBadge();

  // 未参加（グループ0件）かつ未閲覧のときだけグループタブに赤ポチを出す
  const showGroupBadge =
    isLoggedIn === true &&
    !isGroupsLoading &&
    groups.length === 0 &&
    isGroupBadgeSeen === false;

  const isResolvingAuth = isLoading || isLoggedIn === undefined;
  // ログイン済みユーザーにはオンボーディングを出さないため、未ログイン時のみ
  // 完了フラグの確定を待つ。
  const isResolvingOnboarding = !isLoggedIn && isOnboardingCompleted === null;

  if (isResolvingAuth || isResolvingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2E2E2E",
        }}
      >
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!isLoggedIn) {
    // 新規ダウンロードの未ログインユーザーにのみ初回オンボーディングを表示する
    if (!isOnboardingCompleted) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#d08000",
        tabBarInactiveTintColor: "#A1A1AA",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#2E2E2E",
          borderTopColor: "#424242",
        },
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ダッシュボード",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(game-results)"
        options={{
          title: "試合結果",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <BallIcon size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const route = state.routes.find(
              (r: { name: string }) => r.name === "(game-results)",
            );
            if (route?.state && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate("(game-results)", { screen: "index" });
            }
          },
        })}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "成績",
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          tabBarIcon: ({ color, size }) => (
            <StatsIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(groups)"
        options={{
          title: "グループ",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <GroupTabIcon
              size={size}
              color={color}
              showBadge={showGroupBadge}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            markGroupBadgeSeen();
            const state = navigation.getState();
            const groupRoute = state.routes.find(
              (r: { name: string }) => r.name === "(groups)",
            );
            if (groupRoute?.state && groupRoute.state.index > 0) {
              e.preventDefault();
              navigation.navigate("(groups)", { screen: "index" });
            }
          },
        })}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "マイページ",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
