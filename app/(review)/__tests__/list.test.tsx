/**
 * 振り返りレポート一覧画面（advanced_periodic_review）の Pro 制限の振る舞いテスト。
 * 無料ユーザーには実データの代わりにサンプルが Pro ロック付きで表示される。
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
import ReviewListScreen from "../list";

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const realReview = {
  id: 1,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read: true,
  summary: {
    period_type: "weekly",
    practice_days: 99,
    total_swings: 5000,
    active_days: 7,
    streak_current: 40,
  },
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
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "active",
          pro_active: true,
          expires_at: "2026-12-31T00:00:00+09:00",
          days_remaining: 30,
        },
        entitlements: [...FREE_FEATURES, "advanced_periodic_review"],
      }),
    ),
  );
};

const setupReviewsEndpoint = () => {
  server.use(
    http.get(baseUrl("/api/v2/periodic_reviews"), () =>
      HttpResponse.json([realReview]),
    ),
  );
};

describe("ReviewListScreen", () => {
  it("無料ユーザーには実データの代わりにサンプルと Pro ロックが表示される", async () => {
    respondFree();
    setupReviewsEndpoint();

    renderWithProviders(<ReviewListScreen />);

    await waitFor(() =>
      expect(screen.getByText("Pro プランを見る")).toBeOnTheScreen(),
    );
    // サンプルの練習日数（5日）は出るが、実データ（99日）は出ない。
    expect(screen.getByText("5日")).toBeOnTheScreen();
    expect(screen.queryByText("99日")).not.toBeOnTheScreen();
    // サンプルデータであることが分かるラベルが表示される。
    expect(
      screen.getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro プランを見る"));
    // オーバーレイと PaywallModal 両方に見出しが出るため複数ヒットで開いたことを確認する。
    expect(
      screen.getAllByText("週次・月次の振り返りレポートを受け取る").length,
    ).toBeGreaterThan(1);
  });

  it("Proユーザーには実データが表示される", async () => {
    respondPro();
    setupReviewsEndpoint();

    renderWithProviders(<ReviewListScreen />);

    expect(await screen.findByText("99日")).toBeOnTheScreen();
    expect(screen.queryByText("Pro プランを見る")).not.toBeOnTheScreen();
  });

  it("月別ページャで最新月だけを表示し、前の月へ送れる", async () => {
    respondPro();
    server.use(
      http.get(baseUrl("/api/v2/periodic_reviews"), () =>
        HttpResponse.json([
          realReview,
          {
            ...realReview,
            id: 2,
            period_type: "monthly",
            period_start: "2026-06-01",
            period_end: "2026-06-30",
            summary: { ...realReview.summary, period_type: "monthly" },
          },
        ]),
      ),
    );

    renderWithProviders(<ReviewListScreen />);

    // 最新月（7月）のレポートだけが表示され、見出しは月内の週番号になる。
    expect(await screen.findByText("7月 第2週の振り返り")).toBeOnTheScreen();
    expect(screen.queryByText("2026年6月の振り返り")).not.toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText("前の月"));

    expect(await screen.findByText("2026年6月の振り返り")).toBeOnTheScreen();
    expect(screen.queryByText("7月 第2週の振り返り")).not.toBeOnTheScreen();
  });
});
