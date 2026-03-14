import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "ページが見つかりません" }} />
      <View className="flex-1 items-center justify-center bg-main">
        <Text className="text-xl font-bold text-white">
          ページが見つかりません
        </Text>
        <Link href="/" className="mt-4">
          <Text className="text-primary">ホームに戻る</Text>
        </Link>
      </View>
    </>
  );
}
