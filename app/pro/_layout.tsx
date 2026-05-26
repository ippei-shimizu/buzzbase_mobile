import { Stack } from "expo-router";

// /pro 全画面モーダルの内側 Stack。
// 親 (app/_layout.tsx) で presentation: "fullScreenModal" を指定済み。
// 内側はカスタムヘッダー（× ボタン）を使うため自動ヘッダーは無効化する。
export default function ProLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    />
  );
}
