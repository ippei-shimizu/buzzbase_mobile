import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { BallIcon } from "@components/icon/BallIcon";
import { GroupIcon } from "@components/icon/GroupIcon";
import { HomeIcon } from "@components/icon/HomeIcon";
import { StatsIcon } from "@components/icon/StatsIcon";
import { UserIcon } from "@components/icon/UserIcon";
import { BillingIssueAlert } from "@components/pro/BillingIssueAlert";
import { TrialExpiringBanner } from "@components/pro/TrialExpiringBanner";
import { useAuth } from "@hooks/useAuth";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useProStatus } from "@hooks/useProStatus";

export default function TabLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const proFeatures = useFeatureFlag("pro_features");
  const { proStatus } = useProStatus();

  if (isLoading || isLoggedIn === undefined) {
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
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      {proFeatures ? (
        <>
          <BillingIssueAlert subscription={proStatus.subscription} />
          <TrialExpiringBanner subscription={proStatus.subscription} />
        </>
      ) : null}
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
              <GroupIcon size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
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
    </View>
  );
}
