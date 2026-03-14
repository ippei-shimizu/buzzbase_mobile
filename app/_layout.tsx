import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@utils/queryClient";

/** アプリのルートレイアウト。QueryClientProviderでTanStack Queryを全画面に提供。 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          contentStyle: { backgroundColor: "#2E2E2E" },
        }}
      />
    </QueryClientProvider>
  );
}
