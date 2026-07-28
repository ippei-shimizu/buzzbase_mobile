/**
 * StreakHeaderSection の Pro 訴求カードの振る舞いテスト。
 * 「Pro を見る」ボタンは以前 /pro（フルスクリーン）に直接遷移していたが、
 * 他のPro導線と同じ PaywallModal（下からせり出すシート）に統一した。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../../types/pro";
import { formatJaFullDateWithWeekday } from "../../../../utils/formatDate";
import { addDays, todayIso } from "../../../../utils/planDate";
import { StreakHeaderSection } from "../StreakHeaderSection";

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const setupCommonHandlers = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
    http.get(baseUrl("/api/v2/activity_logs"), () =>
      HttpResponse.json({ data: [], from: "2026-06-01", to: "2026-06-30" }),
    ),
    http.get(baseUrl("/api/v2/activity_logs/streak"), () =>
      HttpResponse.json({
        current_streak_days: 0,
        longest_streak_days: 0,
        total_active_days: 0,
      }),
    ),
    http.get(baseUrl("/api/v2/shadow_swing_sessions/stats"), () =>
      HttpResponse.json({ total_count: 0 }),
    ),
  );
};

describe("StreakHeaderSection", () => {
  it("無料ユーザーが「Pro プランを見る」を押すと PaywallModal が開く（/pro への直接遷移はしない）", async () => {
    setupCommonHandlers();

    renderWithProviders(<StreakHeaderSection />);

    await waitFor(() =>
      expect(
        screen.getByText("Pro で全期間の記録マップを表示"),
      ).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("Pro プランを見る"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.getByText("練習履歴を全期間で確認")).toBeOnTheScreen();
  });

  it("「詳細を見る」を押すと草の詳細画面へ遷移する", async () => {
    setupCommonHandlers();

    renderWithProviders(<StreakHeaderSection />);

    fireEvent.press(await screen.findByText("詳細を見る"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(grass)/detail");
  });

  it("無料ユーザーがロック済みセルをタップするとPaywallが開き、未ロックセルは詳細画面へ遷移する", async () => {
    const today = todayIso();
    const homeFrom = addDays(today, -83);
    const clampedFrom = addDays(homeFrom, 10);
    const lockedDate = addDays(homeFrom, 5);
    const unlockedDate = addDays(homeFrom, 20);

    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
      http.get(baseUrl("/api/v2/activity_logs"), () =>
        HttpResponse.json({ data: [], from: clampedFrom, to: today }),
      ),
      http.get(baseUrl("/api/v2/activity_logs/streak"), () =>
        HttpResponse.json({
          current_streak_days: 0,
          longest_streak_days: 0,
          total_active_days: 0,
        }),
      ),
      http.get(baseUrl("/api/v2/shadow_swing_sessions/stats"), () =>
        HttpResponse.json({ total_count: 0 }),
      ),
    );

    renderWithProviders(<StreakHeaderSection />);

    const lockedLabel = `${formatJaFullDateWithWeekday(lockedDate)}（Pro限定）`;
    fireEvent.press(await screen.findByLabelText(lockedLabel));
    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();

    fireEvent.press(
      screen.getByLabelText(formatJaFullDateWithWeekday(unlockedDate)),
    );
    expect(getRouterSpies().push).toHaveBeenCalledWith("/(grass)/detail");
  });
});
