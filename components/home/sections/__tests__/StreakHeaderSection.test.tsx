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
import { StreakHeaderSection } from "../StreakHeaderSection";

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
});
