import type { Season } from "../../../types/season";

/** `GET /seasons` のレスポンス要素のテストデータビルダー。 */
export const buildSeason = (overrides: Partial<Season> = {}): Season => ({
  id: 1,
  name: "2026年",
  game_results_count: 0,
  created_at: "2026-04-01T00:00:00.000+09:00",
  updated_at: "2026-04-01T00:00:00.000+09:00",
  ...overrides,
});
