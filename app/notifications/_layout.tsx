import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function NotificationsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
        headerBackTitle: "戻る",
      }}
    >
      {/*
        index は内部 Stack の initial route のため戻るボタンが自動表示されない。
        ルートStack の前画面(ダッシュボード等)に戻れるよう headerLeft を明示する。
      */}
      <Stack.Screen
        name="index"
        options={{
          title: "お知らせ",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              accessibilityRole="button"
              accessibilityLabel="戻る"
            >
              <Ionicons name="chevron-back" size={28} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "お知らせ詳細" }} />
      <Stack.Screen name="user/[userId]" options={{ title: "プロフィール" }} />
      <Stack.Screen name="user/follows" options={{ title: "フォロー" }} />
      <Stack.Screen name="user/game-detail" options={{ title: "試合詳細" }} />
    </Stack>
  );
}
