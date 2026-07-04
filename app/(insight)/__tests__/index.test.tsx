/**
 * 相関インサイト画面の振る舞いテスト。
 * 無料ユーザーには準備中の訴求カードを出し、成績を断定表示しないことを確認する。
 */
import { waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import InsightScreen from "../insights";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

describe("相関インサイト", () => {
  it("無料ユーザーには準備中カードを表示する", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );

    const { getByText } = renderWithProviders(<InsightScreen />);

    await waitFor(() => {
      expect(getByText("練習と成績の関係を発見")).toBeTruthy();
    });
  });
});
