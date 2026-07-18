/**
 * 相関インサイト画面の振る舞いテスト。
 * 無料ユーザーにはダミーデータ入りの訴求カードを出し、成績を断定表示しないことを確認する。
 * カードタップで PaywallModal（Pro 説明・動線画面）を開けることも確認する。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
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

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

describe("相関インサイト", () => {
  it("無料ユーザーにはダミーデータ入りの訴求カードを表示する", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );

    const { getByText } = renderWithProviders(<InsightScreen />);

    await waitFor(() => {
      expect(getByText("練習と成績の関係を発見")).toBeTruthy();
    });
    expect(
      getByText("素振りが多い週は、打率が高い傾向があります。"),
    ).toBeTruthy();
    expect(getByText("Pro プラン限定")).toBeTruthy();
  });

  it("訴求カードをタップすると Pro 説明・動線画面（PaywallModal）が開く", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );

    renderWithProviders(<InsightScreen />);

    await waitFor(() =>
      expect(screen.getByText("練習と成績の関係を発見")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("練習と成績の関係を発見"));

    expect(await screen.findByText("PRO にアップグレード")).toBeOnTheScreen();
    expect(screen.getByLabelText("PROを始める")).toBeOnTheScreen();
  });
});
