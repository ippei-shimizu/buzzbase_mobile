/**
 * 素振りカウンター画面の振る舞いテスト。
 * 保存 API が失敗したときに「保存しました」と誤認させないことを担保する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import ShadowSwingCounterScreen from "../counter";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({
    // 目標未到達のまま「終了」を押すシナリオを作るため、目標は十分大きくしておく。
    searchParams: {
      sessionId: "7",
      target: "200",
      interval: "20",
      vibration: "0",
      sound: "0",
      voice: "0",
    },
  });
});

const getRouterSpies = (): RouterSpies => {
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock("expo-audio", () => ({
  useAudioPlayer: () => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    loop: false,
    volume: 1,
  }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

const completeUrl = baseUrl("/api/v2/shadow_swing_sessions/7/complete");

describe("素振りカウンター", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );
  });

  it("保存に成功したら完了画面へ saved=1 で遷移する", async () => {
    server.use(
      http.post(completeUrl, () =>
        HttpResponse.json({ id: 7, swing_count: 0 }),
      ),
    );

    const { getByText } = renderWithProviders(<ShadowSwingCounterScreen />);
    fireEvent.press(getByText("終了"));

    await waitFor(() => expect(getRouterSpies().replace).toHaveBeenCalled());
    expect(getRouterSpies().replace).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ saved: "1" }),
      }),
    );
  });

  // 通信が不安定な環境で保存に失敗しても完了画面を出していたため、実際には
  // 1本も記録されていないのに「保存しました」と誤認させていた。
  it("保存に失敗したら完了画面へ進まず、再試行できるダイアログを出す", async () => {
    server.use(http.post(completeUrl, () => HttpResponse.error()));
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);

    const { getByText } = renderWithProviders(<ShadowSwingCounterScreen />);
    fireEvent.press(getByText("終了"));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(alertSpy.mock.calls[0][0]).toBe("保存に失敗しました");
    expect(
      (alertSpy.mock.calls[0][2] ?? []).map((button) => button.text),
    ).toEqual(["保存せず終了", "再試行"]);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("保存失敗後に「保存せず終了」を選ぶと未保存として完了画面へ進む", async () => {
    server.use(http.post(completeUrl, () => HttpResponse.error()));
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);

    const { getByText } = renderWithProviders(<ShadowSwingCounterScreen />);
    fireEvent.press(getByText("終了"));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mock.calls[0][2]?.[0].onPress?.();

    expect(getRouterSpies().replace).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ saved: "0" }),
      }),
    );
  });
});
