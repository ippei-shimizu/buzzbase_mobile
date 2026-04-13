export interface Prefecture {
  id: number;
  name: string;
}

export interface BaseballCategory {
  id: number;
  name: string;
}

export interface Award {
  id: number;
  title: string;
}

export interface TeamDetail {
  id: number;
  name: string;
  category_id: number | null;
  prefecture_id: number | null;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  user_id: string | null;
  image: { url: string | null };
  introduction: string | null;
  team_id: number | null;
  is_private: boolean;
  positions: { id: number; name: string }[];
}

export type FollowStatus = "self" | "none" | "pending" | "following";

export interface UserProfileDetail {
  user: UserProfile;
  isFollowing: boolean;
  follow_status: FollowStatus;
  following_count: number | null;
  followers_count: number | null;
  is_private: boolean;
}

export interface StatsFilters {
  year?: string;
  matchType?: string;
  seasonId?: string;
  tournamentId?: string;
}
