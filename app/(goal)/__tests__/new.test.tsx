/**
 * 目標作成フォームの Pro 制限（カスタム期間・自由指標）の振る舞いテスト。
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
import GoalFormScreen from "../new";

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
        entitlements: [
          ...FREE_FEATURES,
          "custom_period_goals",
          "manual_metric_goals",
        ],
      }),
    ),
  );
};

const setupCommonHandlers = () => {
  server.use(
    http.get(baseUrl("/api/v2/goals"), () => HttpResponse.json([])),
    http.get(apiUrl("/seasons"), () => HttpResponse.json([])),
    http.get(apiUrl("/tournaments/user_tournaments"), () =>
      HttpResponse.json([]),
    ),
    http.get(baseUrl("/api/v2/practice_menus"), () => HttpResponse.json([])),
  );
};

describe("GoalFormScreen（新規）", () => {
  it("無料ユーザーは自由指標タブを選べて、内容欄に Pro 訴求カードが表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(<GoalFormScreen />);

    await waitFor(() =>
      expect(screen.getByLabelText("自由指標（Pro限定）")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByLabelText("自由指標（Pro限定）"));

    // タブは選択でき、指標名入力欄の代わりに Pro 訴求カード（説明文つき）が出る。
    expect(screen.getByText("自由指標で目標を設定")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "球速や体重など、アプリが自動集計できない自分だけの指標も目標にして手入力で管理できます。",
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText("指標名")).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro プランを見る"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.getByLabelText("PROを始める")).toBeOnTheScreen();
  });

  it("無料ユーザーがカスタム期間を選ぶと Pro 訴求カードが表示され、タップで PaywallModal が開く", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(<GoalFormScreen />);

    await waitFor(() =>
      expect(screen.getByText("カスタム期間")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("カスタム期間"));

    expect(screen.getByText("カスタム期間で目標を設定")).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Pro プランを見る"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.getByLabelText("PROを始める")).toBeOnTheScreen();
  });

  it("Proユーザーは自由指標を選択でき、カスタム期間にもPro訴求が出ない", async () => {
    respondPro();
    setupCommonHandlers();

    renderWithProviders(<GoalFormScreen />);

    await waitFor(() => expect(screen.getByText("自由指標")).toBeOnTheScreen());
    // pro/status の取得完了前はロック済み扱いのため、解決を待ってから非表示を確認する。
    await waitFor(() =>
      expect(
        screen.queryByLabelText("自由指標（Pro限定）"),
      ).not.toBeOnTheScreen(),
    );

    fireEvent.press(screen.getByText("自由指標"));
    expect(screen.getByText("指標名")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("カスタム期間"));
    expect(
      screen.queryByText("カスタム期間で目標を設定"),
    ).not.toBeOnTheScreen();
  });
});
