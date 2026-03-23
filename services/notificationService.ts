import axiosInstance from "@utils/axiosInstance";
import type {
  ManagementNotice,
  ManagementNoticesResponse,
  NotificationCount,
  NotificationItem,
} from "../types/notification";

export const getManagementNotices = async (): Promise<ManagementNotice[]> => {
  const response = await axiosInstance.get<ManagementNoticesResponse>(
    "/management_notices",
  );
  return response.data.management_notices;
};

export const getManagementNotice = async (
  id: number,
): Promise<ManagementNotice> => {
  const response = await axiosInstance.get<{ management_notice: ManagementNotice }>(
    `/management_notices/${id}`,
  );
  return response.data.management_notice;
};

export const getNotificationCount = async (): Promise<NotificationCount> => {
  const response = await axiosInstance.get<NotificationCount>(
    "/notifications/count",
  );
  return response.data;
};

export const markManagementNoticesRead = async (): Promise<void> => {
  await axiosInstance.post("/notifications/mark_management_notices_read");
};

export const getNotifications = async (
  userId: string,
): Promise<NotificationItem[]> => {
  const response = await axiosInstance.get<NotificationItem[]>(
    "/notifications",
    {
      params: { user_id: userId },
    },
  );
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await axiosInstance.patch(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/notifications/${id}`);
};
