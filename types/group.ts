export interface Group {
  id: number;
  name: string;
  icon: { url: string | null };
  group_users: { user_id: number; group_id: number }[];
}

export interface GroupUser {
  id: number;
  name: string;
  user_id: string;
  image: { url: string | null };
}

export interface GroupDetail {
  group: Group;
  accepted_users: GroupUser[];
  batting_averages: Record<string, number | null>[];
  batting_stats: Record<string, number | null>[];
  pitching_aggregate: Record<string, number | null>[];
  pitching_stats: Record<string, number | null>[];
  available_years?: number[];
}

export interface GroupMembers {
  group: Group;
  accepted_users: GroupUser[];
  group_creator_id: number;
}

export interface InviteLinkResponse {
  code: string;
  group_name: string;
  group_id: number;
}

export interface InviteLinkInfo {
  group: {
    id: number;
    name: string;
    icon: string | null;
    member_count: number;
  };
  inviter: {
    name: string;
    image: { url: string | null };
  };
}

export interface FollowingUser {
  id: number;
  name: string;
  user_id: string;
  image: { url: string | null };
  is_private: boolean;
  isFollowing: boolean;
}
