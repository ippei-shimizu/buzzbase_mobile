/**
 * 予定詳細画面の記録動線の振る舞いテスト。
 * 試合の予定なら試合記録、それ以外なら練習記録の動線が出ることを確認する。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import ScheduleDetailScreen from "../[id]";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "1" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const baseSchedule = {
  id: 1,
  title: null,
  days_of_week: null,
  scheduled_time: null,
  end_time: null,
  recurring: false,
  menu_set_id: null,
  game_result_id: null,
  note: null,
  notification_enabled: false,
  active: true,
  notification_message: null,
  menus: [],
  logged_practice_menu_ids: [],
};

beforeEach(() => {
  useGameRecordStore.getState().reset();
});

describe("ScheduleDetailScreen", () => {
  it("試合の予定では「試合記録をつける」動線が出て、押すと日付が引き継がれてWizardへ遷移する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () =>
        HttpResponse.json([
          {
            ...baseSchedule,
            event_type: "game",
            planned_on: "2026-07-20",
          },
        ]),
      ),
    );

    renderWithProviders(<ScheduleDetailScreen />);

    await waitFor(() =>
      expect(screen.getByText("試合記録をつける")).toBeOnTheScreen(),
    );
    expect(screen.queryByText("練習記録をつける")).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText("試合記録をつける"));

    expect(useGameRecordStore.getState().date).toBe("2026-07-20");
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(game-record)/step1-game-info",
    );
  });

  it("練習の予定では「練習記録をつける」動線が出る（試合記録の動線は出ない）", async () => {
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () =>
        HttpResponse.json([
          {
            ...baseSchedule,
            event_type: "self_practice",
            planned_on: "2026-07-20",
          },
        ]),
      ),
    );

    renderWithProviders(<ScheduleDetailScreen />);

    await waitFor(() =>
      expect(screen.getByText("練習記録をつける")).toBeOnTheScreen(),
    );
    expect(screen.queryByText("試合記録をつける")).not.toBeOnTheScreen();
  });
});
