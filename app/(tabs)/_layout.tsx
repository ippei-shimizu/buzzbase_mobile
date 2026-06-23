import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { BOTTOM_TAB_ITEMS } from "@components/ui/bottomTabItems";
import { useAuth } from "@hooks/useAuth";
import { useGroups } from "@hooks/useGroups";
import { useGroupTabBadge } from "@hooks/useGroupTabBadge";
import { useOnboarding } from "@hooks/useOnboarding";

export default function TabLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { isCompleted: isOnboardingCompleted } = useOnboarding();
  const { groups, isFetched: isGroupsFetched } = useGroups({
    enabled: isLoggedIn === true,
  });
  const { seen: isGroupBadgeSeen, markSeen: markGroupBadgeSeen } =
    useGroupTabBadge();

  // 取得確定後に未参加（グループ0件）かつ未閲覧のときだけグループタブに赤ポチを出す。
  // isGroupsFetched でフェッチ開始前の一瞬の誤点灯を防ぐ。
  const showGroupBadge =
    isLoggedIn === true &&
    isGroupsFetched &&
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
      {BOTTOM_TAB_ITEMS.map((tab) => {
        const Icon = tab.Icon;
        const isGroupRoute = tab.name === "(groups)";
        // カッコ付きグループ route 配下に積まれたスタックは、再タップで先頭(index)へ戻す。
        const needsStackReset = tab.name === "(game-results)" || isGroupRoute;
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              // カッコ付きグループ route はネスト Stack 側で独自ヘッダを持つため親タブのヘッダは隠す
              headerShown: !tab.name.startsWith("("),
              tabBarIcon: ({ color, size }) => (
                <Icon
                  size={size}
                  color={color}
                  showBadge={isGroupRoute ? showGroupBadge : undefined}
                />
              ),
            }}
            listeners={
              needsStackReset
                ? ({ navigation }) => ({
                    tabPress: (e) => {
                      if (isGroupRoute) markGroupBadgeSeen();
                      const state = navigation.getState();
                      const route = state.routes.find(
                        (r: { name: string }) => r.name === tab.name,
                      );
                      if (route?.state && route.state.index > 0) {
                        e.preventDefault();
                        navigation.navigate(tab.name, { screen: "index" });
                      }
                    },
                  })
                : undefined
            }
          />
        );
      })}
    </Tabs>
  );
}
