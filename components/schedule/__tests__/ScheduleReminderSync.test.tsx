/**
 * スケジュール通知同期コンポーネントの振る舞いテスト。
 * 「特定画面を開いた時だけ通知が同期される」不具合(Critical)の再発防止用。
 */
import { waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { ScheduleReminderSync } from "../ScheduleReminderSync";

const mockGetAll = jest.fn().mockResolvedValue([]);
const mockCancel = jest.fn().mockResolvedValue(undefined);
const mockSchedule = jest.fn().mockResolvedValue("notification-id");

jest.mock("expo-notifications", () => ({
  getAllScheduledNotificationsAsync: () => mockGetAll(),
  cancelScheduledNotificationAsync: (id: string) => mockCancel(id),
  scheduleNotificationAsync: (input: unknown) => mockSchedule(input),
  SchedulableTriggerInputTypes: { WEEKLY: "weekly", DATE: "date" },
}));

const buildSchedule = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  title: "朝練",
  days_of_week: "1",
  planned_on: null,
  scheduled_time: "06:00",
  event_type: "self_practice",
  recurring: true,
  menu_set_id: null,
  game_result_id: null,
  note: null,
  notification_enabled: true,
  active: true,
  notification_message: null,
  menus: [],
  logged_practice_menu_ids: [],
  ...overrides,
});

describe("ScheduleReminderSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([]);
  });

  it("有効なスケジュールを端末のローカル通知として登録する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () =>
        HttpResponse.json([buildSchedule()]),
      ),
    );

    renderWithProviders(<ScheduleReminderSync />);

    await waitFor(() => expect(mockSchedule).toHaveBeenCalled());
    expect(mockSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: "schedule-1-1",
        content: expect.objectContaining({ body: "朝練の時間です" }),
      }),
    );
  });

  it("無効化されたスケジュールは通知を登録しない", async () => {
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () =>
        HttpResponse.json([buildSchedule({ notification_enabled: false })]),
      ),
    );

    renderWithProviders(<ScheduleReminderSync />);

    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  // オフライン起動で予定一覧の取得に失敗すると、空配列が「予定ゼロ」と解釈されて
  // 登録済みリマインドが全消去され、オンラインに戻すまで復活しなかった。
  it("取得に失敗したときは既存の通知を消さない", async () => {
    mockGetAll.mockResolvedValue([{ identifier: "schedule-99-once" }]);
    let requested = false;
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () => {
        requested = true;
        return HttpResponse.error();
      }),
    );

    renderWithProviders(<ScheduleReminderSync />);

    await waitFor(() => expect(requested).toBe(true));
    expect(mockGetAll).not.toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("マウント時に既存のschedule-系通知を一旦解除してから貼り直す", async () => {
    mockGetAll.mockResolvedValue([
      { identifier: "schedule-99-once" },
      { identifier: "other-notification" },
    ]);
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () => HttpResponse.json([])),
    );

    renderWithProviders(<ScheduleReminderSync />);

    await waitFor(() =>
      expect(mockCancel).toHaveBeenCalledWith("schedule-99-once"),
    );
    expect(mockCancel).not.toHaveBeenCalledWith("other-notification");
  });
});
