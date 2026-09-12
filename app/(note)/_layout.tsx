import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";

export default function NoteLayout() {
  const router = useRouter();

  return (
    <Stack
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
            <Icon name="chevron-back" size={24} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="new" options={{ title: "ノートを書く" }} />
      <Stack.Screen name="[id]" options={{ title: "ノート詳細" }} />
      <Stack.Screen name="edit" options={{ title: "ノートを編集" }} />
    </Stack>
  );
}
