import { Stack } from "expo-router";
import { View } from "react-native";

export default function ProfileLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          headerTitleStyle: { fontSize: 16, fontWeight: "600" },
          contentStyle: { backgroundColor: "#2E2E2E" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "マイページ" }} />
        <Stack.Screen name="edit" options={{ title: "プロフィール編集" }} />
        <Stack.Screen name="[userId]" options={{ title: "プロフィール" }} />
        <Stack.Screen name="follows" options={{ title: "フォロー" }} />
        <Stack.Screen name="search" options={{ title: "ユーザー検索" }} />
        <Stack.Screen name="notes" options={{ headerShown: false }} />
        <Stack.Screen name="seasons" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: "設定" }} />
        <Stack.Screen
          name="privacy-policy"
          options={{ title: "プライバシーポリシー" }}
        />
        <Stack.Screen name="terms-of-service" options={{ title: "利用規約" }} />
        <Stack.Screen name="contact" options={{ title: "お問い合わせ" }} />
        <Stack.Screen
          name="account-deletion"
          options={{ title: "アカウント削除" }}
        />
        <Stack.Screen
          name="calculation-of-grades"
          options={{ title: "成績の算出方法" }}
        />
      </Stack>
    </View>
  );
}
