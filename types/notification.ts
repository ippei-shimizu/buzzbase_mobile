export interface ManagementNotice {
  id: number;
  title: string;
  body: string;
  published_at: string; // "YYYY年MM月DD日"
}

export interface ManagementNoticesResponse {
  management_notices: ManagementNotice[];
}

export interface NotificationCount {
  count: number;
}

// 統合通知APIのレスポンス型
export type NotificationEventType =
  | "followed"
  | "follow_request"
  | "follow_request_accepted"
  | "group_invitation"
  | "management_notice";

export interface UserNotification {
  id: number;
  actor_user_id: string;
  actor_name: string;
  actor_icon: { url: string | null };
  event_type:
    | "followed"
    | "follow_request"
    | "follow_request_accepted"
    | "group_invitation";
  event_id: number;
  read_at: string | null;
  created_at: string;
  group_name?: string;
  group_invitation?: string;
  follow_request_id?: number;
}

export interface ManagementNotification {
  id: string;
  event_type: "management_notice";
  title: string;
  management_notice_id: number;
  read_at: string | null;
  created_at: string;
}

export type NotificationItem = UserNotification | ManagementNotification;
