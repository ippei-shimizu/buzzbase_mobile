/**
 * 草ヒートマップの日付タップ詳細（F-06）の振る舞いテスト。
 */
import type { ActivityLog } from "../../../types/activity";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DayDetailModal } from "../DayDetailModal";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const buildActivityLog = (
  overrides: Partial<ActivityLog> = {},
): ActivityLog => ({
  activity_date: "2026-07-15",
  intensity_level: 3,
  has_game: false,
  total_swing_count: 0,
  practice_menu_count: 1,
  ...overrides,
});

const mockSession = (practiceLogs: unknown[]) => {
  server.use(
    http.get(baseUrl("/api/v2/practice_sessions/by_date"), () =>
      HttpResponse.json({
        id: 1,
        logged_on: "2026-07-15",
        memo: null,
        improvement_theme_ids: [],
        practice_logs: practiceLogs,
        condition: null,
        created_at: "2026-07-15T00:00:00Z",
      }),
    ),
  );
};

describe("DayDetailModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("練習内容の一覧を表示する", async () => {
    mockSession([
      {
        id: 1,
        practice_menu_id: 1,
        schedule_id: null,
        logged_on: "2026-07-15",
        amount: 200,
        weight: null,
        menu_name: "素振り",
        unit_label: "本",
        source: "manual",
        memo: null,
        created_at: "2026-07-15T00:00:00Z",
      },
    ]);

    renderWithProviders(
      <DayDetailModal
        date="2026-07-15"
        activityLog={buildActivityLog()}
        onClose={onClose}
      />,
    );

    expect(await screen.findByText("素振り 200本")).toBeOnTheScreen();
  });

  it("試合を実施した日は「試合を実施」を表示する", async () => {
    mockSession([]);

    renderWithProviders(
      <DayDetailModal
        date="2026-07-15"
        activityLog={buildActivityLog({ has_game: true })}
        onClose={onClose}
      />,
    );

    expect(await screen.findByText("試合を実施")).toBeOnTheScreen();
  });

  it("記録が無い日は「この日の記録はありません」を表示する", async () => {
    mockSession([]);

    renderWithProviders(
      <DayDetailModal date="2026-07-15" activityLog={null} onClose={onClose} />,
    );

    expect(
      await screen.findByText("この日の記録はありません"),
    ).toBeOnTheScreen();
  });

  it("「この日の練習を編集」を押すと練習記録画面へ遷移しモーダルを閉じる", async () => {
    mockSession([]);

    renderWithProviders(
      <DayDetailModal date="2026-07-15" activityLog={null} onClose={onClose} />,
    );

    await waitFor(() =>
      expect(screen.getByText("この日の記録はありません")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByLabelText("この日の練習を編集"));

    expect(getRouterSpies().push).toHaveBeenCalledWith({
      pathname: "/(practice-record)/daily",
      params: { date: "2026-07-15" },
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("date が null の場合はモーダルを表示しない", () => {
    renderWithProviders(
      <DayDetailModal date={null} activityLog={null} onClose={onClose} />,
    );

    expect(screen.queryByText("この日の記録はありません")).toBeNull();
  });
});
