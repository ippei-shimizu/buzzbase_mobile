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
