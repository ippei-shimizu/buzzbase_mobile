/**
 * メニュー推移画面（practice_menu_trend_detail）を素振り（source=shadow_swing）経由で開いた場合の振る舞い。
 * 素振りログは practice_menu に紐付かないため、専用の /shadow_swing_sessions/trend を叩く。
 */
import { screen, waitFor } from "@testing-library/react-native";
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
      source: "shadow_swing",
      menuName: "素振り",
      unit: "count",
      unitLabel: "本",
    },
  });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const shadowSwingTrend = {
  menu: {
    id: null,
    name: "素振り",
    unit: "count",
    unit_label: "本",
    is_weight_reps: false,
  },
  by_year: [],
  by_month: [
    { period: "2026-06", total_amount: 900, total_volume: 0, days_count: 12 },
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

const setupShadowSwingTrendEndpoint = () => {
  server.use(
    http.get(baseUrl("/api/v2/shadow_swing_sessions/trend"), () =>
      HttpResponse.json(shadowSwingTrend),
    ),
  );
};

describe("MenuTrendScreen（素振り経由）", () => {
  it("無料ユーザーは素振り推移APIを叩かず、サンプルデータを表示する", async () => {
    respondFree();
    // 素振り推移APIのハンドラは登録しない。呼び出されれば onUnhandledRequest: "error" で検知できる。

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(
      screen.getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeOnTheScreen();
  });

  it("Proユーザーは素振りの実データの推移を取得して表示する", async () => {
    respondPro();
    setupShadowSwingTrendEndpoint();

    renderWithProviders(<MenuTrendScreen />);

    await waitFor(() => expect(screen.getByText("素振り")).toBeOnTheScreen());
    expect(
      screen.queryByText("サンプルデータ（実際の記録ではありません）"),
    ).not.toBeOnTheScreen();
    expect(await screen.findByText("900本")).toBeOnTheScreen();
  });
});
