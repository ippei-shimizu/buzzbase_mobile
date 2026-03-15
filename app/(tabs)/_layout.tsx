import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";

export default function TabLayout() {
  const { isLoggedIn, isLoading } = useAuth();

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#d08000",
        tabBarInactiveTintColor: "#A1A1AA",
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
          title: "ホーム",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(game-results)"
        options={{
          title: "試合結果",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="baseball" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(groups)"
        options={{
          title: "グループ",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "プロフィール",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
