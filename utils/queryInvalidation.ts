import type { QueryClient } from "@tanstack/react-query";

/**
 * 試合結果関連のTanStack Queryキャッシュをまとめてinvalidateするヘルパー。
 *
 * 試合結果の作成・編集・削除を行った後は、各画面ごとに別キーでキャッシュされている
 * 試合一覧やダッシュボード集計を一括で更新する必要がある。各呼び出し元で
 * 個別に invalidateQueries を書くと invalidate 漏れが起きやすいため、
 * このヘルパーで一元管理する。
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
  queryClient.invalidateQueries({ queryKey: ["gameResults"] });
  queryClient.invalidateQueries({ queryKey: ["userGameResults"] });
  queryClient.invalidateQueries({ queryKey: ["filteredGameResults"] });
  queryClient.invalidateQueries({ queryKey: ["filteredUserGameResults"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["profile"] });
};
