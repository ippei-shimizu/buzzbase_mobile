import { Stack } from "expo-router";

export default function NoteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="new" options={{ title: "ノートを書く" }} />
    </Stack>
  );
}
