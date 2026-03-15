import { Stack } from "expo-router";

export default function GameResultsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "試合結果" }} />
      <Stack.Screen name="[id]" options={{ title: "試合詳細" }} />
    </Stack>
  );
}
