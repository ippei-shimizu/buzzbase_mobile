/**
 * 練習メニュー作成フォームのエラー表示の振る舞いテスト。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import PracticeMenuFormScreen from "../form";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

const getRouterSpies = (): RouterSpies => {
  const routerMock = require("expo-router") as { __routerSpies: RouterSpies };
  return routerMock.__routerSpies;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const saveMenu = (name: string) => {
  fireEvent.changeText(
    screen.getByPlaceholderText("例: 素振り、ティー、ランニング"),
    name,
  );
  fireEvent.press(screen.getByText("保存"));
};

describe("PracticeMenuFormScreen（新規）", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () => HttpResponse.json([])),
    );
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("素振りメニューが重複して 422 になったらサーバーの理由を表示し、フォームに留まる", async () => {
    server.use(
      http.post(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json(
          { errors: ["「素振り」のメニューは既に登録されています"] },
          { status: 422 },
        ),
      ),
    );

    renderWithProviders(<PracticeMenuFormScreen />);
    saveMenu("素振り");

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "保存に失敗しました",
        "「素振り」のメニューは既に登録されています",
      ),
    );
    expect(getRouterSpies().back).not.toHaveBeenCalled();
  });

  it("無料枠上限の 403 では Paywall 導線を出し、サーバー文言に流さない", async () => {
    server.use(
      http.post(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json(
          { error: "Pro プランで練習メニューを無制限に登録できます" },
          { status: 403 },
        ),
      ),
    );

    renderWithProviders(<PracticeMenuFormScreen />);
    saveMenu("ティー");

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "無料プランの上限",
        expect.stringContaining("無料で3つまで"),
        expect.any(Array),
      ),
    );
  });

  it("通信断でも理由の分かる文言を表示する", async () => {
    server.use(
      http.post(baseUrl("/api/v2/practice_menus"), () => HttpResponse.error()),
    );

    renderWithProviders(<PracticeMenuFormScreen />);
    saveMenu("ティー");

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "保存に失敗しました",
        expect.stringContaining("通信状況"),
      ),
    );
  });

  it("レート制限では内部コードではなくサーバーの文言を表示する", async () => {
    server.use(
      http.post(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json(
          {
            error: "rate_limit_exceeded",
            message: "試行回数が上限に達しました。時間をおいてお試しください",
          },
          { status: 429 },
        ),
      ),
    );

    renderWithProviders(<PracticeMenuFormScreen />);
    saveMenu("ティー");

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "保存に失敗しました",
        "試行回数が上限に達しました。時間をおいてお試しください",
      ),
    );
  });
});
