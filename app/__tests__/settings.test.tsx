/**
 * 設定画面の振る舞いテスト。
 *
 * 検証対象:
 * - 「レビューで応援する」タップで OS ごとに正しい store URL で `Linking.openURL` が呼ばれる
 * - 「成績の算出方法」「お問い合わせ」「プロフィール編集」のタップで適切な router.push が呼ばれる
 * - 「ログアウト」確認で承認した場合に (tabs) スタックを畳んでサインイン画面へ遷移する
 * - バージョン表示が `Constants.expoConfig?.version` から組み立てられる
 *
 * 方針:
 * - HTTP 境界（ログアウト時の `/auth/sign_out`）は MSW で intercept する。
 * - 環境境界（expo-router, expo-constants, Native Module）は jest.mock OK。
 * - `Linking.openURL` / `Alert.alert` は `jest.spyOn` で局所モック（react-native 標準 API）。
 */
import type { RouterSpies } from "../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert, Linking, Platform } from "react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import {
  apiUrl,
  authSuccessHeaders,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import { useAuthStore } from "../../stores/authStore";
import SettingsScreen from "../settings";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.0.25" } },
}));

jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}));

const useFeatureFlagMock = useFeatureFlag as jest.Mock;

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

const setPlatformOS = (os: "ios" | "android") => {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os,
  });
};

describe("SettingsScreen", () => {
  let canOpenSpy: jest.SpyInstance;
  let openURLSpy: jest.SpyInstance;
  const originalOS = Platform.OS;

  beforeEach(() => {
    useFeatureFlagMock.mockReturnValue(false);
    canOpenSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const spies = getRouterSpies();
    Object.values(spies).forEach((fn) => {
      if (typeof fn?.mockClear === "function") fn.mockClear();
    });
    // canDismiss はデフォルト挙動（true）を維持する
    getRouterSpies().canDismiss.mockReturnValue(true);
  });

  afterEach(() => {
    canOpenSpy.mockRestore();
    openURLSpy.mockRestore();
    setPlatformOS(originalOS as "ios" | "android");
  });

  it("バージョン表示が Constants から組み立てられる", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    expect(getByText("バージョン 1.0.25")).toBeTruthy();
  });

  it("iOS では「レビューで応援する」タップで App Store のレビュー URL が開く", async () => {
    setPlatformOS("ios");
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("レビューで応援する"));
    await waitFor(() => {
      expect(openURLSpy).toHaveBeenCalledWith(
        "itms-apps://itunes.apple.com/app/id6761011816?action=write-review",
      );
    });
  });

  it("Android では「レビューで応援する」タップで Play Store のアプリページが開く", async () => {
    setPlatformOS("android");
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("レビューで応援する"));
    await waitFor(() => {
      expect(openURLSpy).toHaveBeenCalledWith(
        "market://details?id=jp.buzzbase.mobile",
      );
    });
  });

  it("canOpenURL が false を返す場合は openURL を呼ばない", async () => {
    setPlatformOS("ios");
    canOpenSpy.mockResolvedValueOnce(false);
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("レビューで応援する"));
    // canOpenURL の resolve を待つ
    await waitFor(() => expect(canOpenSpy).toHaveBeenCalled());
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it("「成績の算出方法」タップで calculation-of-grades 画面へ遷移する", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("成績の算出方法"));
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(profile)/calculation-of-grades",
    );
  });

  it("「お問い合わせ」タップで contact 画面へ遷移する", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("お問い合わせ"));
    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/contact");
  });

  it("「プロフィール編集」タップで edit 画面へ遷移する", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("プロフィール編集"));
    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/edit");
  });

  describe("Pro サブスクリプション管理リンク", () => {
    it("pro_features=true のとき「サブスクリプション管理」リンクが表示される", () => {
      useFeatureFlagMock.mockReturnValue(true);

      const { getByText } = renderWithProviders(<SettingsScreen />);

      expect(getByText("サブスクリプション管理")).toBeTruthy();
    });

    it("タップで /account/subscription に push する", () => {
      useFeatureFlagMock.mockReturnValue(true);

      const { getByText } = renderWithProviders(<SettingsScreen />);
      fireEvent.press(getByText("サブスクリプション管理"));

      expect(getRouterSpies().push).toHaveBeenCalledWith(
        "/account/subscription",
      );
    });

    it("pro_features=false のときはリンクが描画されない", () => {
      useFeatureFlagMock.mockReturnValue(false);

      const { queryByText } = renderWithProviders(<SettingsScreen />);

      expect(queryByText("サブスクリプション管理")).toBeNull();
    });
  });

  it("「アカウント削除」タップで account-deletion 画面へ遷移する", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("アカウント削除"));
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(profile)/account-deletion",
    );
  });

  describe("ログアウト", () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
      // useAuth の useEffect 内 validateToken が走らないよう、ログイン済み状態にする。
      useAuthStore.getState().setIsLoggedIn(true);
    });

    afterEach(() => {
      alertSpy?.mockRestore();
      useAuthStore.setState({ isLoggedIn: undefined, isLoading: false });
    });

    const pressLogoutConfirm = (
      buttonText: "ログアウト" | "キャンセル" = "ログアウト",
    ) => {
      alertSpy = jest.spyOn(Alert, "alert").mockImplementation(((
        _title: string,
        _message?: string,
        buttons?: { text?: string; onPress?: () => void }[],
      ) => {
        buttons?.find((b) => b.text === buttonText)?.onPress?.();
      }) as unknown as typeof Alert.alert);
    };

    it("確認ダイアログで「ログアウト」を選ぶと (tabs) スタックを畳んでサインイン画面に遷移する", async () => {
      server.use(
        http.delete(apiUrl("/auth/sign_out"), () =>
          HttpResponse.json({}, { headers: authSuccessHeaders() }),
        ),
      );
      pressLogoutConfirm("ログアウト");
      const { getByText } = renderWithProviders(<SettingsScreen />);
      fireEvent.press(getByText("ログアウト"));

      const spies = getRouterSpies();
      await waitFor(() => {
        expect(spies.replace).toHaveBeenCalledWith("/(auth)/sign-in");
      });
      expect(spies.canDismiss).toHaveBeenCalled();
      expect(spies.dismissAll).toHaveBeenCalled();
    });

    it("サーバー sign_out が失敗してもサインイン画面に遷移する", async () => {
      server.use(
        http.delete(apiUrl("/auth/sign_out"), () =>
          HttpResponse.json({ errors: ["server error"] }, { status: 500 }),
        ),
      );
      pressLogoutConfirm("ログアウト");
      const { getByText } = renderWithProviders(<SettingsScreen />);
      fireEvent.press(getByText("ログアウト"));

      const spies = getRouterSpies();
      await waitFor(() => {
        expect(spies.replace).toHaveBeenCalledWith("/(auth)/sign-in");
      });
      expect(spies.dismissAll).toHaveBeenCalled();
    });

    it("確認ダイアログで「キャンセル」を選ぶと遷移しない", () => {
      pressLogoutConfirm("キャンセル");
      const { getByText } = renderWithProviders(<SettingsScreen />);
      fireEvent.press(getByText("ログアウト"));

      const spies = getRouterSpies();
      expect(spies.replace).not.toHaveBeenCalled();
      expect(spies.dismissAll).not.toHaveBeenCalled();
    });
  });
});
