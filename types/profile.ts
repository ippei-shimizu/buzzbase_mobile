export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  user_id: string | null;
  image: { url: string | null };
  introduction: string | null;
  team_id: number | null;
  is_private: boolean;
}

export interface StatsFilters {
  year?: string;
  matchType?: string;
  seasonId?: string;
}
