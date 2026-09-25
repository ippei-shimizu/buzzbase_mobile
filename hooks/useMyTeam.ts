import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getMyTeam } from "@services/teamService";

/**
 * ユーザーの所属チーム情報（チーム名・カテゴリ名・都道府県名）を取得するフック。
 *
 * @param userId ユーザーの公開 ID（`user_id` 文字列）
 * @returns チーム表示用の各値と、プルダウン更新用の `refetch` / `isRefreshing`
 */
export const useMyTeam = (userId: string | null | undefined) => {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["myTeam", userId],
    queryFn: () => getMyTeam(userId!),
    enabled: !!userId,
  });

  // refetch は enabled を無視して発火するため、userId 未確定のまま呼ばれると
  // `/teams/undefined/my_team` を叩いてしまう。呼び出し側で判定せずに済むようここで塞ぐ。
  const refetchIfReady = useCallback(async () => {
    if (userId) await refetch();
  }, [userId, refetch]);

  return {
    teamName: data?.name,
    categoryName: data?.category_name ?? undefined,
    prefectureName: data?.prefecture_name ?? undefined,
    isLoading,
    isRefreshing: isRefetching,
    refetch: refetchIfReady,
  };
};
