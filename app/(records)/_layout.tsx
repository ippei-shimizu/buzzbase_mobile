import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function RecordsLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="list"
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
        // グループ起点の list を含め、全画面で戻る導線を明示する。
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="list" options={{ title: "記録一覧" }} />
      <Stack.Screen
        name="summary"
        options={{ title: "メニュー別の積み上げ" }}
      />
      <Stack.Screen name="trend" options={{ title: "メニューの推移" }} />
    </Stack>
  );
}
