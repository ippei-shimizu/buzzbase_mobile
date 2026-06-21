import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
