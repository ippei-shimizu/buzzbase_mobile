export interface FollowResponse {
  status: string;
  message: string;
  follow_status: "following" | "pending";
}

export interface UnfollowResponse {
  status: string;
  message: string;
}
