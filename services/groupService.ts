import axiosInstance from "@utils/axiosInstance";
import type {
  Group,
  GroupDetail,
  GroupMembers,
  FollowingUser,
} from "../types/group";

export const getGroups = async (): Promise<Group[]> => {
  const response = await axiosInstance.get<Group[]>("/groups");
  return response.data;
};

export const getGroupDetail = async (id: number): Promise<GroupDetail> => {
  const response = await axiosInstance.get<GroupDetail>(`/groups/${id}`);
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

export const getFollowingUsers = async (
  userId: number,
): Promise<FollowingUser[]> => {
  const response = await axiosInstance.get<FollowingUser[]>(
    `/users/${userId}/following_users`,
  );
  return response.data;
};
