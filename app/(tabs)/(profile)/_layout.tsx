import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "プロフィール" }} />
      <Stack.Screen name="edit" options={{ title: "プロフィール編集" }} />
    </Stack>
  );
}
