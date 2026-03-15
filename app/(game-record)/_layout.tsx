import { Stack } from "expo-router";

export default function GameRecordLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="step1-game-info" options={{ title: "試合情報" }} />
      <Stack.Screen name="step2-batting" options={{ title: "打撃成績" }} />
      <Stack.Screen name="step3-pitching" options={{ title: "投手成績" }} />
      <Stack.Screen
        name="summary"
        options={{ title: "サマリー", headerBackVisible: false }}
      />
    </Stack>
  );
}
