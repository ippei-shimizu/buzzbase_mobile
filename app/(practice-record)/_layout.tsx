import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function PracticeRecordLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="daily"
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen
        name="daily"
        options={{
          title: "練習を記録",
          // 初期画面のため自動の戻るボタンが出ない。ホームへ戻る導線を明示する。
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
      <Stack.Screen name="menu-new" options={{ title: "新しいメニュー" }} />
    </Stack>
  );
}
