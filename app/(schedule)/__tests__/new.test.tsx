/**
 * 予定編集フォームで、練習ログが記録済み（logged_practice_menu_ids）のメニューを
 * 変更できないようにする振る舞いのテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import ScheduleFormScreen from "../new";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "1" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const menuLogged = {
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: 200,
  sort_order: 0,
};
const menuFree = {
  id: 2,
  name: "ティー打撃",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: 50,
  sort_order: 1,
};

const schedule = {
  id: 1,
  title: "朝練",
  days_of_week: "1",
  planned_on: null,
  scheduled_time: "06:00",
  end_time: null,
  event_type: "self_practice",
  recurring: true,
  menu_set_id: null,
  game_result_id: null,
  note: null,
  notification_enabled: true,
  active: true,
  notification_message: null,
  menus: [
    {
      practice_menu_id: 1,
      name: "素振り",
      unit_label: "本",
      target_value: 200,
    },
    {
      practice_menu_id: 2,
      name: "ティー打撃",
      unit_label: "本",
      target_value: 50,
    },
  ],
  logged_practice_menu_ids: [1],
};

// ["schedules"] クエリの解決前に editing（useState の遅延初期化）が評価されると
// メニュー選択状態が空のまま固定されてしまうため、レンダー前にキャッシュへ注入する。
const buildScheduleQueryClient = () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(["schedules"], [schedule]);
  return queryClient;
};

describe("ScheduleFormScreen（編集）", () => {
  it("練習ログが記録済みのメニューはトグル・数量変更ができない", async () => {
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () =>
        HttpResponse.json([schedule]),
      ),
      http.get(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json([menuLogged, menuFree]),
      ),
      http.get(baseUrl("/api/v2/menu_sets"), () => HttpResponse.json([])),
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );

    renderWithProviders(<ScheduleFormScreen />, {
      queryClient: buildScheduleQueryClient(),
    });

    // ロック表示の文言は editing のみに依存するため、practice_menus の取得完了
    // より先に描画されうる。素振りの表示を待つことで menus 側の取得も待ち合わせる。
    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(
      screen.getByText("練習記録が済のメニューは変更できません"),
    ).toBeOnTheScreen();

    // 記録済みメニューは選択状態のまま、タップしても解除されない。
    fireEvent.press(screen.getByText("素振り"));
    expect(screen.getByDisplayValue("200")).toBeOnTheScreen();

    // 未記録のメニューは通常どおりトグルできる。
    // スケジュールの構成メニューとして初期状態から選択済みのため、
    // 1回目のタップで解除され、2回目のタップで再選択される。
    fireEvent.press(screen.getByText("ティー打撃"));
    expect(screen.queryByDisplayValue("50")).not.toBeOnTheScreen();
    fireEvent.press(screen.getByText("ティー打撃"));
    expect(screen.getByDisplayValue("50")).toBeOnTheScreen();
  });
});
