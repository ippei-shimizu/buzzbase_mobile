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
      <Stack.Screen name="user/[userId]" options={{ title: "プロフィール" }} />
      <Stack.Screen name="user/follows" options={{ title: "フォロー" }} />
      <Stack.Screen name="user/game-detail" options={{ title: "試合詳細" }} />
    </Stack>
  );
}
