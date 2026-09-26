/**
 * 試合記録サマリー画面の「野球ノートを記録する」「記録を完了する」動線の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { InterstitialAd } from "react-native-google-mobile-ads";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { useGameRecordStore } from "../../../stores/gameRecordStore";
import SummaryScreen from "../summary";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  isPostHogEnabled: true,
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  requestReview: jest.fn().mockResolvedValue(undefined),
}));

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { replace: jest.Mock } };
  return m.__routerSpies;
};

const pressCompleteButton = async () => {
  const completeButton = await screen.findByRole("button", {
    name: "記録を完了する",
  });
  fireEvent.press(completeButton);
};

beforeEach(() => {
  mockCapture.mockClear();
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  useGameRecordStore.getState().reset();
  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [] }),
    ),
  );
});

describe("SummaryScreen", () => {
  it("「野球ノートを記録する」を押すと、試合を紐付けて野球ノート作成画面へ遷移する", async () => {
    useGameRecordStore.setState({ gameResultId: 123, isEditMode: false });

    renderWithProviders(<SummaryScreen />);

    await waitFor(() =>
      expect(screen.getByText("野球ノートを記録する")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("野球ノートを記録する"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith({
        pathname: "/(note)/new",
        params: { gameResultId: "123" },
      });
    });
  });

  it("「記録を完了する」を押すと、試合記録の完了を計測して試合一覧へ遷移する", async () => {
    useGameRecordStore.setState({
      gameResultId: 123,
      isEditMode: false,
      matchType: "公式戦",
      appearanceType: "starter",
      pitchingResultId: null,
    });

    renderWithProviders(<SummaryScreen />);

    await pressCompleteButton();

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith({
        pathname: "/(tabs)/(game-results)",
        params: { tab: "list" },
      });
    });
    expect(mockCapture).toHaveBeenCalledWith("game record completed", {
      match_type: "regular",
      appearance_type: "starter",
      has_pitching: false,
    });
  });

  it("「記録を完了する」でレビューの条件を満たすと、広告を出さずに OS のレビューを要求して試合一覧へ遷移する", async () => {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const storage = new Map<string, string>([
      ["store_review_positive_event_count", "1"],
      ["store_review_install_date", thirtyDaysAgo],
      ["admob_install_date", thirtyDaysAgo],
      ["admob_launch_count", "10"],
    ]);
    (InterstitialAd.createForAdRequest as jest.Mock).mockClear();
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(
      async (key: string) => storage.get(key) ?? null,
    );
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        storage.set(key, value);
      },
    );
    useGameRecordStore.setState({ gameResultId: 123, isEditMode: false });

    renderWithProviders(<SummaryScreen />);

    await pressCompleteButton();

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith({
        pathname: "/(tabs)/(game-results)",
        params: { tab: "list" },
      });
    });
    expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
    expect(InterstitialAd.createForAdRequest).not.toHaveBeenCalled();
  });
});
