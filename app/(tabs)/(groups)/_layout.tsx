import { Stack } from "expo-router";

export default function GroupsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "グループ" }} />
      <Stack.Screen name="[id]" options={{ title: "グループ詳細" }} />
      <Stack.Screen name="create" options={{ title: "グループ作成" }} />
      <Stack.Screen name="edit" options={{ title: "グループ編集" }} />
      <Stack.Screen name="members" options={{ title: "メンバー" }} />
      <Stack.Screen name="invite" options={{ title: "メンバー招待" }} />
    </Stack>
  );
}
