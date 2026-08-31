/**
 * メニュー推移詳細画面（practice_menu_trend_detail）の Pro 制限の振る舞いテスト。
 * 無料ユーザーは推移詳細APIを叩かず、サンプルデータ + Pro訴求カードを表示する。
 * Proユーザーは実データの推移を取得して表示する。
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
  return buildExpoRouterMock({
    searchParams: {
      menuId: "1",
      menuName: "素振り",
      unit: "count",
      unitLabel: "本",
    },
  });
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
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
  it("無料ユーザーは推移詳細APIを叩かず、サンプルデータとPro訴求カードを表示する", async () => {
    respondFree();
    // 推移詳細APIのハンドラは登録しない。呼び出されれば onUnhandledRequest: "error" で検知できる。

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(
      screen.getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Pro プランを見る")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro プランを見る"));
    // ProUpsellCard と PaywallModal 両方に見出しが出るため複数ヒットで開いたことを確認する。
    expect(
      screen.getAllByText("メニューごとの推移を詳しく見る").length,
    ).toBeGreaterThan(1);
  });

  it("Proユーザーは実データの推移を取得して表示する", async () => {
    respondPro();
    setupTrendEndpoint();

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(screen.queryByText("Pro プランを見る")).not.toBeOnTheScreen();
    expect(
      screen.queryByText("サンプルデータ（実際の記録ではありません）"),
    ).not.toBeOnTheScreen();
    expect(await screen.findByText("600本")).toBeOnTheScreen();
  });
});
