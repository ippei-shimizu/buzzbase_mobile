/**
 * 「今日のやること」のメニュートグルの振る舞いテスト。
 * 複数メニューを同時にトグルしたとき、片方が失敗しても
 * もう片方の楽観的更新が巻き戻らないことを確認する。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { delay } from "msw";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import { TodayTasksSection } from "../TodayTasksSection";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const SWING_MENU_ID = 10;
const RUN_MENU_ID = 20;

const buildMenu = (practiceMenuId: number, name: string) => ({
  practice_menu_id: practiceMenuId,
  name,
  unit_label: null,
  target_value: null,
  sort_order: practiceMenuId,
  done: false,
});

const plan = {
  id: 1,
  title: "自主練",
  event_type: "self_practice",
  scheduled_time: null,
  end_time: null,
  recurring: false,
  menu_set_id: null,
  game_result_id: null,
  note: null,
  menus: [
    buildMenu(SWING_MENU_ID, "素振り"),
    buildMenu(RUN_MENU_ID, "ランニング"),
  ],
  done: false,
};

const createDeferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
};

const isChecked = (name: string) =>
  screen.getByRole("checkbox", { name }).props.accessibilityState?.checked;

describe("TodayTasksSection のメニュートグル", () => {
  it("2件を同時にトグルして片方が失敗しても、もう片方の完了状態は保たれる", async () => {
    const swingRequest = createDeferred();
    const runRequest = createDeferred();
    let planFetchCount = 0;

    server.use(
      // 初回ロード以降の refetch は解決させず、楽観的更新の結果だけを検証する。
      http.get(baseUrl("/api/v2/plans/by_date"), async () => {
        planFetchCount += 1;
        if (planFetchCount > 1) {
          await delay("infinite");
        }
        return HttpResponse.json([plan]);
      }),
      http.post(baseUrl("/api/v2/practice_logs"), async ({ request }) => {
        const body = (await request.json()) as {
          practice_log: { practice_menu_id: number };
        };
        if (body.practice_log.practice_menu_id === RUN_MENU_ID) {
          await runRequest.promise;
          return new HttpResponse(null, { status: 500 });
        }
        await swingRequest.promise;
        return HttpResponse.json({ id: 100 }, { status: 201 });
      }),
    );

    renderWithProviders(<TodayTasksSection />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());

    // 失敗する側を先にタップすることで、成功側の楽観的更新より前のキャッシュを掴ませる。
    fireEvent.press(screen.getByRole("checkbox", { name: "ランニング" }));
    fireEvent.press(screen.getByRole("checkbox", { name: "素振り" }));

    await waitFor(() => expect(isChecked("素振り")).toBe(true));

    swingRequest.release();
    runRequest.release();

    await waitFor(() => expect(isChecked("ランニング")).toBe(false));
    expect(isChecked("素振り")).toBe(true);
  });
});
