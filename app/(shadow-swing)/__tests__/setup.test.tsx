/**
 * 素振りカウンター設定画面の振る舞いテスト。
 * 累計 stats を取得しつつ、開始ボタンが表示されることを確認する。
 */
import { waitFor } from "@testing-library/react-native";
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
/* eslint-enable @typescript-eslint/no-require-imports */

describe("素振りカウンター設定", () => {
  it("通算本数を表示し、開始ボタンを出す", async () => {
    server.use(
      http.get(baseUrl("/api/v2/shadow_swing_sessions/stats"), () =>
        HttpResponse.json({
          today_count: 0,
          month_count: 0,
          total_count: 12450,
        }),
      ),
    );

    const { getByText } = renderWithProviders(<ShadowSwingSetupScreen />);

    expect(getByText("開始する")).toBeTruthy();
    await waitFor(() => expect(getByText(/12,450本/)).toBeTruthy());
  });
});
