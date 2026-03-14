import { QueryClient } from "@tanstack/react-query";

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
