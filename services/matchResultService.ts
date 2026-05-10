import axiosInstance from "@utils/axiosInstance";

export const getAvailableYears = async (userId?: number): Promise<string[]> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axiosInstance.get<string[]>(
    "/match_results/available_years",
    { params },
  );
  return response.data;
};

/**
 * 試合作成フォームの初期値レスポンス。
 *
 * - inning_format: 直近試合のイニング制（7 or 9）。履歴なしは 9
 * - match_type: 直近試合の試合種類（"公式戦" / "オープン戦" / その他）。履歴なしは null
 * - defensive_position: プロフィール最初のポジション。未設定なら直近試合の defensive_position。両方なしで null
 * - batting_order: 直近試合の打順（"1"〜"9" / "DH"）。履歴なしは null
 */
export interface MatchResultFormDefaults {
  inning_format: number;
  match_type: string | null;
  defensive_position: string | null;
  batting_order: string | null;
}

/**
 * 試合作成フォームの初期値を取得する。
 * バックエンドが旧仕様（inning_format のみ）を返した場合に備え、欠損フィールドは null で補完する。
 */
export const getMatchResultFormDefaults =
  async (): Promise<MatchResultFormDefaults> => {
    const response = await axiosInstance.get<Partial<MatchResultFormDefaults>>(
      "/match_results/form_defaults",
    );
    return {
      inning_format: response.data.inning_format ?? 9,
      match_type: response.data.match_type ?? null,
      defensive_position: response.data.defensive_position ?? null,
      batting_order: response.data.batting_order ?? null,
    };
  };
