import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function GrassLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="detail"
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen
        name="detail"
        options={{
          title: "記録マップ",
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
      />
    </Stack>
  );
}
