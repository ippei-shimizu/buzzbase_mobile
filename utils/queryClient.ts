import { focusManager, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AppState, type AppStateStatus } from "react-native";

/**
 * useQuery の retry 戦略。
 *
 * 4xx / タイムアウト / 非 HTTP 例外はリトライ無し、5xx・ネットワーク断のみ 1 回だけリトライ。
 * テストからも本物の判定を再利用できるよう named export している。
 */
export const queryClientRetryFn = (
  failureCount: number,
  error: unknown,
): boolean => {
  // queryFn のプログラマーエラーや非 HTTP 例外はリトライしても結果が変わらない
  if (!axios.isAxiosError(error)) return false;
  // タイムアウト: 同じ条件でリトライしても無駄。即座にエラー表示へ。
  if (error.code === "ECONNABORTED") return false;
  // 4xx: サーバが意図的に拒否した結果。リトライしても結果は変わらない。
  const status = error.response?.status;
  if (status && status >= 400 && status < 500) return false;
  // 5xx / ネットワーク断絶のみ最大 1 回までリトライ。
  return failureCount < 1;
};

/**
 * TanStack Queryのグローバルクライアント設定
 *
 * - retry: {@link queryClientRetryFn}
 * - staleTime: 5分間はキャッシュを新鮮とみなす
 * - gcTime: 10分間未使用のキャッシュをガベージコレクション
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: queryClientRetryFn,
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
