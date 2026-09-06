import { useQuery } from "@tanstack/react-query";
import { getTeamName, searchTeams } from "@services/gameRecordService";

/**
 * チーム名のインクリメンタル検索フック。
 * teams は全ユーザー共有で単調増加するマスタのため、全件を先読みせず
 * 検索語があるときだけ部分一致で取得する。
 */
export const useTeamSearch = (q: string) => {
  const trimmed = q.trim();
  const { data, isLoading } = useQuery({
    queryKey: ["teams", { q: trimmed }],
    queryFn: () => searchTeams(trimmed),
    enabled: !!trimmed,
  });

  return { teams: data ?? [], isLoading };
};

/**
 * チーム ID からチーム名を解決するフック（プロフィール既定チームの自動セット用）。
 */
export const useTeamName = (teamId: number | null | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["teamName", teamId],
    queryFn: () => getTeamName(teamId!),
    enabled: teamId != null,
  });

  return { teamName: data?.name, isLoading };
};
