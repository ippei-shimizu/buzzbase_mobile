/**
 * マイページ下部のフィードバック / レビュー導線の振る舞いテスト。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Linking, Platform } from "react-native";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { FeedbackFooter } from "../FeedbackFooter";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

describe("FeedbackFooter", () => {
  let canOpenSpy: jest.SpyInstance;
  let openURLSpy: jest.SpyInstance;
  const originalOS = Platform.OS;

  beforeEach(() => {
    canOpenSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    getRouterSpies().push.mockClear();
  });

  afterEach(() => {
    canOpenSpy.mockRestore();
    openURLSpy.mockRestore();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => originalOS,
    });
  });

  it("「ご意見・ご要望を送る」でフィードバック用のお問い合わせ画面へ遷移する", () => {
    renderWithProviders(<FeedbackFooter />);
    fireEvent.press(
      screen.getByRole("button", { name: "ご意見・ご要望を送る" }),
    );
    expect(getRouterSpies().push).toHaveBeenCalledWith({
      pathname: "/(profile)/contact",
      params: { subject: "feedback" },
    });
  });

  it("「レビューで応援する」でストアのレビュー画面を開く", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      get: () => "ios",
    });
    renderWithProviders(<FeedbackFooter />);
    fireEvent.press(screen.getByRole("button", { name: "レビューで応援する" }));
    await waitFor(() => {
      expect(openURLSpy).toHaveBeenCalledWith(
        "itms-apps://itunes.apple.com/app/id6761011816?action=write-review",
      );
    });
  });
});
