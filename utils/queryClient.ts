import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";

/**
 * TanStack Queryのグローバルクライアント設定
 *
 * - retry: 失敗時に最大2回リトライ
 * - staleTime: 5分間はキャッシュを新鮮とみなす
 * - gcTime: 10分間未使用のキャッシュをガベージコレクション
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5分
      gcTime: 10 * 60 * 1000, // 10分
    },
  },
});

/**
 * React Native向けのフォーカスイベント連携。
 *
 * TanStack Queryのデフォルトの `refetchOnWindowFocus` はブラウザのフォーカスを見るため、
 * React NativeではAppStateに置き換える必要がある。
 * これによりアプリ復帰（active）時に staleなクエリが自動再フェッチされ、
 * バックグラウンド/ロック中にスキップした通知一覧・バッジ件数の更新が
 * フォアグラウンド復帰時に補填される。
 *
 * 参考: https://tanstack.com/query/latest/docs/framework/react/react-native#refetch-on-app-focus
 */
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    "change",
    (status: AppStateStatus) => {
      handleFocus(status === "active");
    },
  );
  return () => subscription.remove();
});
