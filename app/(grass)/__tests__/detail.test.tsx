/**
 * 草ヒートマップ詳細画面の振る舞いテスト。
 * F-05 月別ナビゲーション・F-06 日付タップ詳細・F-11 年単位ビュー（Pro限定）。
 */
import type { Feature } from "../../../types/pro";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import GrassDetailScreen from "../detail";

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const PRO_STATUS = {
  ...DEFAULT_PRO_STATUS,
  subscription: {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "active" as const,
    pro_active: true,
  },
  entitlements: [
    ...DEFAULT_PRO_STATUS.entitlements,
    "grass_full_history",
  ] as Feature[],
};

const setupHandlers = (proStatus: typeof DEFAULT_PRO_STATUS) => {
  server.use(
    http.get(apiUrl("/pro/status"), () => HttpResponse.json(proStatus)),
    http.get(baseUrl("/api/v2/activity_logs"), ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        from: url.searchParams.get("from"),
        to: url.searchParams.get("to"),
        current_streak_days: 0,
        longest_streak_days: 0,
        total_active_days: 0,
        data: [],
      });
    }),
  );
};

describe("GrassDetailScreen", () => {
  beforeEach(() => {
    // 月末日に固定することで「前月」が必ず無料の直近30日枠から完全に外れるようにする。
    jest.useFakeTimers({
      doNotFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "nextTick",
        "setImmediate",
        "queueMicrotask",
      ],
    });
    jest.setSystemTime(new Date(2026, 6, 31, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("無料ユーザーが前月へ戻ろうとするとPaywallが表示され、月は移動しない", async () => {
    setupHandlers(DEFAULT_PRO_STATUS);

    renderWithProviders(<GrassDetailScreen />);
    await waitFor(() => expect(screen.getByText("月")).toBeOnTheScreen());

    fireEvent.press(screen.getByLabelText("前の月へ"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.getByText("練習履歴を全期間で確認")).toBeOnTheScreen();
  });

  it("無料ユーザーが「年」を選ぶとPaywallが表示され、年ビューには切り替わらない", async () => {
    setupHandlers(DEFAULT_PRO_STATUS);

    renderWithProviders(<GrassDetailScreen />);

    fireEvent.press(await screen.findByText("年"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.queryByText(/^通算 \d+日$/)).toBeNull();
  });

  it("Proユーザーは前月へ移動でき、Paywallは表示されない", async () => {
    setupHandlers(PRO_STATUS);

    renderWithProviders(<GrassDetailScreen />);
    await waitFor(() => expect(screen.getByText("月")).toBeOnTheScreen());
    const initialTitle = screen.getByText(/年 \d+月/).props.children;

    fireEvent.press(screen.getByLabelText("前の月へ"));

    await waitFor(() => {
      const title = screen.getByText(/年 \d+月/).props.children;
      expect(title).not.toEqual(initialTitle);
    });
    expect(screen.queryByText("BUZZ BASE")).toBeNull();
  });

  it("Proユーザーは「年」ビューに切り替えて通算日数を確認できる", async () => {
    setupHandlers(PRO_STATUS);

    renderWithProviders(<GrassDetailScreen />);
    fireEvent.press(await screen.findByText("年"));

    expect(await screen.findByText("通算 0日")).toBeOnTheScreen();
    expect(screen.queryByText("BUZZ BASE")).toBeNull();
  });
});
