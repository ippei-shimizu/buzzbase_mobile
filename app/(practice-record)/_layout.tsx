import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";

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
        // グループ外（ホーム・一覧）から push されると自動の戻るボタンが遷移元に戻らないため、
        // 全画面で router.back() の戻る導線を明示する。
        headerLeft: () => (
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
            style={{ padding: 8 }}
          >
            <Icon name="chevron-back" size={24} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="daily" options={{ title: "練習を記録" }} />
      <Stack.Screen name="[id]" options={{ title: "練習の記録" }} />
    </Stack>
  );
}
