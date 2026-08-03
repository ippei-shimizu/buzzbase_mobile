/**
 * 素振りカウンター設定画面の振る舞いテスト。
 * 累計 stats を取得しつつ、開始ボタンが表示されることを確認する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import ShadowSwingSetupScreen from "../setup";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

const getRouterSpies = (): RouterSpies => {
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const stubStats = () =>
  server.use(
    http.get(baseUrl("/api/v2/shadow_swing_sessions/stats"), () =>
      HttpResponse.json({ today_count: 0, month_count: 0, total_count: 12450 }),
    ),
  );

const buildSession = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  logged_on: "2026-08-02",
  target_count: 200,
  swing_count: 0,
  completed_at: null,
  practice_log_id: null,
  interval_seconds: 5,
  vibration_enabled: false,
  sound_enabled: true,
  voice_enabled: false,
  ...overrides,
});

describe("素振りカウンター設定", () => {
  beforeEach(() => jest.clearAllMocks());

  it("通算本数を表示し、開始ボタンを出す", async () => {
    stubStats();

    const { getByText } = renderWithProviders(<ShadowSwingSetupScreen />);

    expect(getByText("開始する")).toBeTruthy();
    await waitFor(() => expect(getByText(/12,450本/)).toBeTruthy());
  });

  it("設定をサーバーへ送り、サーバーが返した設定でカウンターへ遷移する", async () => {
    stubStats();
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.post(
        baseUrl("/api/v2/shadow_swing_sessions"),
        async ({ request }) => {
          requestBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(buildSession(), { status: 201 });
        },
      ),
    );

    const { getByText } = renderWithProviders(<ShadowSwingSetupScreen />);
    fireEvent.press(getByText("開始する"));

    await waitFor(() => expect(getRouterSpies().push).toHaveBeenCalled());
    expect(requestBody).toEqual({
      shadow_swing_session: {
        target_count: 200,
        interval_seconds: 5,
        vibration_enabled: false,
        sound_enabled: true,
        voice_enabled: false,
      },
    });
    // Pro 限定設定の可否はサーバーが決める。画面はレスポンスの値でカウンターを起動する。
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          sessionId: "7",
          interval: "5",
          vibration: "0",
        }),
      }),
    );
  });

  it("サーバーが Pro 限定設定を拒否したらエラーメッセージを表示し、遷移しない", async () => {
    stubStats();
    server.use(
      http.post(baseUrl("/api/v2/shadow_swing_sessions"), () =>
        HttpResponse.json(
          { errors: ["インターバルは無料プランでは5〜8秒のみ選べます"] },
          { status: 422 },
        ),
      ),
    );
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);

    const { getByText } = renderWithProviders(<ShadowSwingSetupScreen />);
    fireEvent.press(getByText("開始する"));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "インターバルは無料プランでは5〜8秒のみ選べます",
      ),
    );
    expect(getRouterSpies().push).not.toHaveBeenCalled();
  });
});
