import { TouchableOpacity, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGameRecordStore } from "../../stores/gameRecordStore";

export default function GameRecordLayout() {
  const router = useRouter();
  const reset = useGameRecordStore((s) => s.reset);

  const handleClose = () => {
    Alert.alert("入力を中断しますか？", "入力中のデータは破棄されます。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "中断する",
        style: "destructive",
        onPress: () => {
          reset();
          router.back();
        },
      },
    ]);
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen
        name="step1-game-info"
        options={{
          title: "試合情報",
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
              <Ionicons name="close" size={24} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="step2-batting" options={{ title: "打撃成績" }} />
      <Stack.Screen name="step3-pitching" options={{ title: "投手成績" }} />
      <Stack.Screen
        name="summary"
        options={{ title: "サマリー", headerBackVisible: false }}
      />
    </Stack>
  );
}
