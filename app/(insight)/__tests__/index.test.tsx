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
    expect(getByText("Pro プランを見る")).toBeTruthy();
    // ダミーデータは3件表示し、複数の傾向を発見できる機能だと伝える。
    expect(
      getByText("素振りが多い週は、打率が高い傾向があります。"),
    ).toBeTruthy();
    expect(getByText("睡眠時間とコンディションの関係")).toBeTruthy();
    expect(getByText("練習日数と三振の関係")).toBeTruthy();
    // サンプルデータであることが分かるラベルが表示される。
    expect(
      getByText("サンプルデータ（実際の記録ではありません）"),
    ).toBeTruthy();
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
    fireEvent.press(screen.getByText("Pro プランを見る"));

    expect(await screen.findByText("BUZZ BASE")).toBeOnTheScreen();
    expect(screen.getByLabelText("7日間無料で試す")).toBeOnTheScreen();
  });
});
