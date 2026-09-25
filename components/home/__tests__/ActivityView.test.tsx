import { screen } from "@testing-library/react-native";
import { positionInTree } from "../../../__tests__/test-utils/positionInTree";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { initializeMobileAds } from "../../../services/mobileAdsService";
import { ActivityView } from "../ActivityView";

describe("ActivityView", () => {
  it("活動面の主要セクションを表示する", () => {
    const { getByText } = renderWithProviders(<ActivityView />);

    expect(getByText("継続")).toBeTruthy();
    expect(getByText("今日のやること")).toBeTruthy();
    expect(getByText("練習ツール")).toBeTruthy();
    expect(getByText("目標管理")).toBeTruthy();
    expect(getByText("最近の練習")).toBeTruthy();
  });

  it("広告を「今日のやること」の直後に表示する", async () => {
    // BannerAd は SDK 初期化前にマウントされると空枠のままになるため、
    // コンポーネント側が初期化完了を待つ。本番と同じ順序をテストでも再現する。
    await initializeMobileAds();

    renderWithProviders(<ActivityView />);

    await screen.findByLabelText("mock-banner-ad");
    expect(positionInTree("mock-banner-ad")).toBeGreaterThan(
      positionInTree("今日のやること"),
    );
    expect(positionInTree("mock-banner-ad")).toBeLessThan(
      positionInTree("練習ツール"),
    );
  });
});
