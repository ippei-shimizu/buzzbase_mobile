/**
 * 設定画面の振る舞いテスト。
 *
 * 検証対象:
 * - 「レビューで応援する」タップで OS ごとに正しい store URL で `Linking.openURL` が呼ばれる
 * - 「成績の算出方法」「お問い合わせ」「プロフィール編集」のタップで適切な router.push が呼ばれる
 * - バージョン表示が `Constants.expoConfig?.version` から組み立てられる
 *
 * 方針:
 * - `services/*` は MSW で intercept する原則だが、本画面は API を呼ばないため対象外。
 * - 環境境界（expo-router, expo-constants, Native Module）は jest.mock OK。
 * - `Linking.openURL` は `jest.spyOn` で局所モック（react-native 標準 API）。
 */
import type { RouterSpies } from "../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Linking, Platform } from "react-native";
import { renderWithProviders } from "../../__tests__/test-utils/renderWithProviders";
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
    canOpenSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const spies = getRouterSpies();
    Object.values(spies).forEach((fn) => fn.mockClear());
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

  it("「アカウント削除」タップで account-deletion 画面へ遷移する", () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    fireEvent.press(getByText("アカウント削除"));
    expect(getRouterSpies().push).toHaveBeenCalledWith(
      "/(profile)/account-deletion",
    );
  });
});
