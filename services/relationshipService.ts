import axiosInstance from "@utils/axiosInstance";
import type {
  FollowResponse,
  FollowRequestResponse,
  UnfollowResponse,
} from "../types/relationship";
import type { FollowingUser } from "../types/group";

export const followUser = async (
  followedId: number,
): Promise<FollowResponse> => {
  const response = await axiosInstance.post<FollowResponse>("/relationships", {
    followed_id: followedId,
  });
  return response.data;
};

export const unfollowUser = async (
  followedId: number,
): Promise<UnfollowResponse> => {
  const response = await axiosInstance.delete<UnfollowResponse>(
    `/relationships/${followedId}`,
  );
  return response.data;
};

export const acceptFollowRequest = async (
  relationshipId: number,
): Promise<FollowRequestResponse> => {
  const response = await axiosInstance.post<FollowRequestResponse>(
    `/relationships/${relationshipId}/accept_follow_request`,
  );
  return response.data;
};

export const rejectFollowRequest = async (
  relationshipId: number,
): Promise<FollowRequestResponse> => {
  const response = await axiosInstance.post<FollowRequestResponse>(
    `/relationships/${relationshipId}/reject_follow_request`,
  );
  return response.data;
};

export const getFollowersUsers = async (
  userId: number,
): Promise<FollowingUser[]> => {
  const response = await axiosInstance.get<FollowingUser[]>(
    `/users/${userId}/followers_users`,
  );
  return response.data;
};
