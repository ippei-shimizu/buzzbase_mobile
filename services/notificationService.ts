import axiosInstance from "@utils/axiosInstance";
import type {
  ManagementNotice,
  ManagementNoticesResponse,
  NotificationCount,
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
  const response = await axiosInstance.get<ManagementNotice>(
    `/management_notices/${id}`,
  );
  return response.data;
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
