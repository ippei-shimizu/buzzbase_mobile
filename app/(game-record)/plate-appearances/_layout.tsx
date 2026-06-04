import { Stack } from "expo-router";

/**
 * 打席記録（v2 ステップ式 UI）のサブ Stack。
 * `index` は打席リスト、`new` は新規打席ウィザード。
 * ヘッダーの戻る矢印で前画面に戻る前提なので、headerLeft の close ボタンは親 layout に任せる。
 */
export default function PlateAppearancesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "打席一覧" }} />
      <Stack.Screen name="new" options={{ title: "打席記録" }} />
    </Stack>
  );
}
