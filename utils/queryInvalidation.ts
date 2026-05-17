import type { QueryClient } from "@tanstack/react-query";

/**
 * 試合結果関連のTanStack Queryキャッシュをまとめてinvalidateするヘルパー。
 *
 * 試合結果の作成・編集・削除を行った後は、各画面ごとに別キーでキャッシュされている
 * 試合一覧やダッシュボード集計を一括で更新する必要がある。各呼び出し元で
 * 個別に invalidateQueries を書くと invalidate 漏れが起きやすいため、
 * このヘルパーで一元管理する。
 *
 * `refetchType: "none"` を指定しているため、その場では再フェッチを発火させず
 * キャッシュを stale マークするのみ。実際の refetch は各画面が次にフォーカス
 * された際の `useFocusEffect` / `useQuery` が担う。これにより、編集完了 →
 * 画面遷移と同時に複数 useQuery が並列 refetch して native view を一度に
 * 再 mount する負荷（iOS の App Hang 要因）を回避する。
 *
 * 対象 queryKey:
 * - `gameResults` — 全体の試合結果一覧
 * - `userGameResults` — ユーザー別試合一覧
 * - `filteredGameResults` — フィルター済み試合一覧
 * - `filteredUserGameResults` — フィルター済みユーザー別試合一覧
 * - `dashboard` — ダッシュボード集計
 * - `profile` — プロフィール（試合数・打率などのサマリー）
 *
 * @param queryClient - 呼び出し元で `useQueryClient()` で取得した QueryClient
 */
export const invalidateGameResultRelated = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    queryKey: ["gameResults"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["userGameResults"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["filteredGameResults"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["filteredUserGameResults"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["dashboard"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["profile"],
    refetchType: "none",
  });
};
