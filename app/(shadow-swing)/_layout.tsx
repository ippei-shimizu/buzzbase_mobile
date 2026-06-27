import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function ShadowSwingLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="setup"
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen
        name="setup"
        options={{
          title: "素振りカウンター",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="counter"
        options={{
          title: "素振り中",
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="complete"
        options={{ title: "完了", headerBackVisible: false }}
      />
    </Stack>
  );
}
