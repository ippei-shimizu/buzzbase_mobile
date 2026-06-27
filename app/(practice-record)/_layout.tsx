import { Stack } from "expo-router";

export default function PracticeRecordLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "練習を記録" }} />
      <Stack.Screen name="menu-new" options={{ title: "新しいメニュー" }} />
      <Stack.Screen name="amount-input" options={{ title: "練習を記録" }} />
      <Stack.Screen name="condition" options={{ title: "コンディション" }} />
    </Stack>
  );
}
