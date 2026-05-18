import type { QueryClient } from "@tanstack/react-query";

/**
 * `invalidateGameResultRelated` の挙動モード。
 *
 * - `"stale-only"`（デフォルト）: その場で再フェッチを発火させずキャッシュを stale
 *   マークするのみ。実際の refetch は各画面の `useFocusEffect` / `useQuery` に委ねる。
 *   編集・新規作成完了 → 画面遷移と同時の並列 refetch を避ける用途。
 * - `"refetch"`: stale マーク後、active な useQuery を即座に refetch する
 *   (TanStack Query デフォルト挙動)。削除など、戻り先に `useFocusEffect` が無い
 *   画面 (例: ホームタブのダッシュボード) でも即座に消えた行を反映したい場合に使う。
 */
export type InvalidateGameResultMode = "stale-only" | "refetch";

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
 * @param mode - `"stale-only"`（既定）か `"refetch"`。詳細は {@link InvalidateGameResultMode}
 */
export const invalidateGameResultRelated = (
  queryClient: QueryClient,
  mode: InvalidateGameResultMode = "stale-only",
): void => {
  const refetchType = mode === "refetch" ? "active" : "none";
  queryClient.invalidateQueries({ queryKey: ["gameResults"], refetchType });
  queryClient.invalidateQueries({ queryKey: ["userGameResults"], refetchType });
  queryClient.invalidateQueries({
    queryKey: ["filteredGameResults"],
    refetchType,
  });
  queryClient.invalidateQueries({
    queryKey: ["filteredUserGameResults"],
    refetchType,
  });
  queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType });
  queryClient.invalidateQueries({ queryKey: ["profile"], refetchType });
};
