/**
 * メニュー推移詳細画面（practice_menu_trend_detail）の Pro 制限の振る舞いテスト。
 * フィルタ・グラフは無料ユーザーには覆われる。数値一覧はラベル（期間）は見えるが、
 * 数値だけ「Pro限定」バッジで隠される。
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
import MenuTrendScreen from "../trend";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { menuId: "1" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const trend = {
  menu: {
    id: 1,
    name: "素振り",
    unit: "count",
    unit_label: "本",
    is_weight_reps: false,
  },
  by_year: [],
  by_month: [
    { period: "2026-06", total_amount: 600, total_volume: 0, days_count: 10 },
  ],
  by_day: [],
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
        entitlements: [...FREE_FEATURES, "practice_menu_trend_detail"],
      }),
    ),
  );
};

const setupTrendEndpoint = () => {
  server.use(
    http.get(baseUrl("/api/v2/practice_menu_trends/1"), () =>
      HttpResponse.json(trend),
    ),
  );
};

describe("MenuTrendScreen", () => {
  it("無料ユーザーはフィルタ・グラフ・数値エリアの上に Pro ロックが表示される", async () => {
    respondFree();
    setupTrendEndpoint();

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(
      screen.getByText("メニューごとの推移を詳しく見る"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Pro プランを見る")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro プランを見る"));
    // オーバーレイと PaywallModal 両方に見出しが出るため複数ヒットで開いたことを確認する。
    expect(
      screen.getAllByText("メニューごとの推移を詳しく見る").length,
    ).toBeGreaterThan(1);

    // 数値一覧はラベル（期間）は見え、数値側には「Pro限定」バッジが重なる
    // （暗幕は視覚的に隠すのみで要素自体はツリーに残るため、ラベルの可視性のみ確認する）。
    expect(screen.getByText("2026/6")).toBeOnTheScreen();
    expect(screen.getByText("Pro限定")).toBeOnTheScreen();
  });

  it("Proユーザーはフィルタ・グラフ・数値エリアを操作できる", async () => {
    respondPro();
    setupTrendEndpoint();

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(screen.queryByText("Pro プランを見る")).not.toBeOnTheScreen();
    expect(await screen.findByText("600本")).toBeOnTheScreen();
  });
});
