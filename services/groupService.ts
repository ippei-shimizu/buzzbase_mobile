import axiosInstance from "@utils/axiosInstance";
import type {
  Group,
  GroupDetail,
  GroupMembers,
  FollowingUser,
  InviteLinkResponse,
  InviteLinkInfo,
} from "../types/group";

export const getGroups = async (): Promise<Group[]> => {
  const response = await axiosInstance.get<Group[]>("/groups");
  return response.data;
};

export const getGroupDetail = async (
  id: number,
  year?: string,
  matchType?: string,
  tournamentId?: string,
): Promise<GroupDetail> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (matchType) params.append("match_type", matchType);
  if (tournamentId) params.append("tournament_id", tournamentId);
  const query = params.toString();
  const response = await axiosInstance.get<GroupDetail>(
    `/groups/${id}${query ? `?${query}` : ""}`,
  );
  return response.data;
};

export const createGroup = async (formData: FormData): Promise<Group> => {
  const response = await axiosInstance.post<Group>("/groups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateGroupInfo = async (
  id: number,
  formData: FormData,
): Promise<void> => {
  await axiosInstance.put(`/groups/${id}/update_group_info`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteGroup = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/groups/${id}`);
};

export const getGroupMembers = async (id: number): Promise<GroupMembers> => {
  const response = await axiosInstance.get<GroupMembers>(
    `/groups/${id}/show_group_user`,
  );
  return response.data;
};

export const inviteMembers = async (
  id: number,
  userIds: number[],
): Promise<void> => {
  await axiosInstance.post(`/groups/${id}/invite_members`, {
    user_ids: userIds,
  });
};

export const acceptInvitation = async (groupId: number): Promise<void> => {
  await axiosInstance.post(`/group_invitations/${groupId}/accept_invitation`);
};

export const declineInvitation = async (groupId: number): Promise<void> => {
  await axiosInstance.post(`/group_invitations/${groupId}/declined_invitation`);
};

export const getOrCreateInviteLink = async (
  groupId: number,
): Promise<InviteLinkResponse> => {
  const response = await axiosInstance.post<InviteLinkResponse>(
    `/groups/${groupId}/invite_link`,
  );
  return response.data;
};

export const getInviteLinkInfo = async (
  code: string,
): Promise<InviteLinkInfo> => {
  const response = await axiosInstance.get<InviteLinkInfo>(
    `/invite_links/${code}`,
  );
  return response.data;
};

export const acceptInviteLink = async (
  code: string,
): Promise<{ success: boolean; group_id: number }> => {
  const response = await axiosInstance.post<{
    success: boolean;
    group_id: number;
  }>(`/invite_links/${code}/accept`);
  return response.data;
};

export const getFollowingUsers = async (
  userId: number,
): Promise<FollowingUser[]> => {
  const response = await axiosInstance.get<FollowingUser[]>(
    `/users/${userId}/following_users`,
  );
  return response.data;
};
