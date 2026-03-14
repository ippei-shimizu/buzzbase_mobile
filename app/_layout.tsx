import "../global.css";
import { ActivityIndicator, View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@hooks/useAuth";
import { queryClient } from "@utils/queryClient";

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading || isLoggedIn === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-main">
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isLoggedIn === false) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <RootNavigator />
    </QueryClientProvider>
  );
}
