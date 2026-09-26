import { useQueries, useQuery } from "@tanstack/react-query";
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

// チーム名はほぼ変わらず、変更時はプロフィール保存が ["teamName"] を失効させるため、
// 投手選択モーダルを開くたびの再取得を抑える。
const TEAM_NAME_STALE_TIME = 5 * 60_000;

/**
 * チーム ID からチーム名を解決するフック（プロフィール既定チームの自動セット用）。
 */
export const useTeamName = (teamId: number | null | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["teamName", teamId],
    queryFn: () => getTeamName(teamId!),
    enabled: teamId != null,
    staleTime: TEAM_NAME_STALE_TIME,
  });

  return { teamName: data?.name, isLoading };
};

/**
 * 複数のチーム ID をまとめて名前に解決するフック（一覧表示用）。
 *
 * @param teamIds 解決したいチーム ID。重複は1回だけ取得する
 * @returns チーム ID → チーム名。取得済みのものだけ入る
 */
export const useTeamNames = (teamIds: number[]) => {
  const uniqueTeamIds = [...new Set(teamIds)];
  const results = useQueries({
    queries: uniqueTeamIds.map((teamId) => ({
      queryKey: ["teamName", teamId],
      queryFn: () => getTeamName(teamId),
      staleTime: TEAM_NAME_STALE_TIME,
    })),
  });

  const teamNameById = new Map<number, string>();
  results.forEach((result, index) => {
    if (result.data) teamNameById.set(uniqueTeamIds[index], result.data.name);
  });
  return teamNameById;
};
