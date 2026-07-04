export interface MonthOption {
  key: string;
  label: string;
}

/**
 * 記録のある年月（"YYYY-MM" の降順リスト、バックエンドの available_months）から
 * FilterDropdown 用の選択肢を作る。FilterDropdown は「全て」（= 未選択 / 開放端）を
 * 自前で持つため、ここでは年月の選択肢のみを渡された順（新しい順）で返す。
 *
 * @param months 記録のある年月（例 ["2026-06", "2026-05"]）
 */
export const monthOptionsFromRecorded = (months: string[]): MonthOption[] =>
  months.map((month) => {
    const [year, monthNumber] = month.split("-");
    return { key: month, label: `${Number(year)}年${Number(monthNumber)}月` };
  });
