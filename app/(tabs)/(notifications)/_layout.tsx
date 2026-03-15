import { Stack } from "expo-router";

export default function NotificationsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "お知らせ" }} />
      <Stack.Screen name="[id]" options={{ title: "お知らせ詳細" }} />
    </Stack>
  );
}
