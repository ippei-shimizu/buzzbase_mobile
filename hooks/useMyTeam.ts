import { useQuery } from "@tanstack/react-query";
import { getMyTeam } from "@services/teamService";

/**
 * ユーザーの所属チーム情報（チーム名・カテゴリ名・都道府県名）を取得するフック。
 *
 * @param userId ユーザーの公開 ID（`user_id` 文字列）
 */
export const useMyTeam = (userId: string | null | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["myTeam", userId],
    queryFn: () => getMyTeam(userId!),
    enabled: !!userId,
  });

  return {
    teamName: data?.name,
    categoryName: data?.category_name ?? undefined,
    prefectureName: data?.prefecture_name ?? undefined,
    isLoading,
  };
};
