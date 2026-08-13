import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";

export default function InsightLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
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
      <Stack.Screen
        name="insights"
        options={{ title: "練習と成績のつながり" }}
      />
      <Stack.Screen name="create" options={{ title: "組み合わせを作る" }} />
    </Stack>
  );
}
