import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function ProfileLayout() {
  const router = useRouter();

  // 設定画面（ルートStack）から router.push で直接遷移してくる画面は、
  // このStackの先頭になり canGoBack() が効かないため、戻るボタンを明示する。
  const backHeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
      accessibilityRole="button"
      accessibilityLabel="戻る"
    >
      <Ionicons name="chevron-back" size={28} color="#F4F4F4" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "マイページ" }} />
      <Stack.Screen
        name="edit"
        options={{ title: "プロフィール編集", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen name="[userId]" options={{ title: "プロフィール" }} />
      <Stack.Screen name="follows" options={{ title: "フォロー" }} />
      <Stack.Screen name="search" options={{ title: "ユーザー検索" }} />
      <Stack.Screen name="notes" options={{ headerShown: false }} />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: "プライバシーポリシー", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: "利用規約", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen
        name="tokushoho"
        options={{
          title: "特定商取引法に基づく表記",
          headerLeft: backHeaderLeft,
        }}
      />
      <Stack.Screen
        name="contact"
        options={{ title: "お問い合わせ", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen
        name="account-deletion"
        options={{ title: "アカウント削除", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen
        name="calculation-of-grades"
        options={{ title: "成績の算出方法", headerLeft: backHeaderLeft }}
      />
      <Stack.Screen name="game-detail" options={{ title: "試合詳細" }} />
    </Stack>
  );
}
