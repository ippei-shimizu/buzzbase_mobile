import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          contentStyle: { backgroundColor: "#2E2E2E" },
        }}
      />
    </>
  );
}
