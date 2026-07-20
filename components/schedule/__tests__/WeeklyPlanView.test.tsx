/**
 * WeeklyPlanView の「来週にコピー」Pro制限の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS, FREE_FEATURES } from "../../../types/pro";
import { WeeklyPlanView } from "../WeeklyPlanView";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const PRO_STATUS = {
  subscription: {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "active",
    pro_active: true,
    expires_at: "2026-12-31T00:00:00+09:00",
    days_remaining: 30,
  },
  entitlements: [...FREE_FEATURES, "schedule_copy_next_week"],
};

const respondFree = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
  );
};

const respondPro = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () => HttpResponse.json(PRO_STATUS)),
  );
};

describe("WeeklyPlanView", () => {
  it("無料ユーザーが「来週にコピー」を押すと Pro 訴求が表示され、コピーAPIは呼ばれない", async () => {
    respondFree();
    let copyCalled = false;
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () => HttpResponse.json([])),
      http.post(baseUrl("/api/v2/schedules/week_copy"), () => {
        copyCalled = true;
        return HttpResponse.json([], { status: 201 });
      }),
    );

    renderWithProviders(<WeeklyPlanView />);

    // pro/status 解決前はボタンが無効なので、有効化（判定確定）を待ってから押す。
    await waitFor(() => expect(screen.getByText("来週にコピー")).toBeEnabled());
    fireEvent.press(screen.getByText("来週にコピー"));

    await waitFor(() =>
      expect(
        screen.getByText("今週のプランを来週にまるごとコピー"),
      ).toBeOnTheScreen(),
    );
    expect(copyCalled).toBe(false);
  });

  it("Proユーザーが「来週にコピー」を押すとコピーAPIが呼ばれる", async () => {
    respondPro();
    let requestedWeekStart: unknown;
    server.use(
      http.get(baseUrl("/api/v2/schedules"), () => HttpResponse.json([])),
      http.post(baseUrl("/api/v2/schedules/week_copy"), async ({ request }) => {
        const body = (await request.json()) as { week_start?: string };
        requestedWeekStart = body.week_start;
        return HttpResponse.json([], { status: 201 });
      }),
    );

    renderWithProviders(<WeeklyPlanView />);

    // pro/status 解決前はボタンが無効なので、有効化（判定確定）を待ってから押す。
    await waitFor(() => expect(screen.getByText("来週にコピー")).toBeEnabled());
    fireEvent.press(screen.getByText("来週にコピー"));

    await waitFor(() => expect(requestedWeekStart).toBeTruthy());
  });
});
