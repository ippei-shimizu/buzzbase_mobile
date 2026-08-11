import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function GoalLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="list"
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
        // 各画面はグループの起点として push されるため自動の戻るが出ない。明示する。
        headerLeft: () => (
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="list"
        options={{
          title: "目標",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(goal)/badges")}
              style={{ padding: 8 }}
              accessibilityLabel="達成バッジ一覧"
            >
              <Ionicons name="ribbon-outline" size={22} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: "新しい目標" }} />
      <Stack.Screen name="badges" options={{ title: "達成バッジ" }} />
      <Stack.Screen name="[id]" options={{ title: "目標の詳細" }} />
    </Stack>
  );
}
