/**
 * 画面専用バナー広告(スクロール末尾)のPro非表示判定の振る舞いテスト。
 */
import { screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { initializeMobileAds } from "../../../services/mobileAdsService";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import { InlineBannerAd } from "../InlineBannerAd";

describe("InlineBannerAd", () => {
  // BannerAd は SDK 初期化前にマウントされると空枠のままになるため、
  // コンポーネント側が初期化完了を待つ。本番と同じ順序をテストでも再現する。
  beforeEach(async () => {
    await initializeMobileAds();
  });

  it("無料ユーザーにはバナー広告を表示する", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json(DEFAULT_PRO_STATUS),
      ),
    );

    renderWithProviders(<InlineBannerAd placement="stats" />);

    expect(await screen.findByLabelText("mock-banner-ad")).toBeOnTheScreen();
  });

  it("Pro加入者(no_ads entitlement)にはバナー広告を表示しない", async () => {
    server.use(
      http.get(apiUrl("/pro/status"), () =>
        HttpResponse.json({
          ...DEFAULT_PRO_STATUS,
          subscription: {
            ...DEFAULT_PRO_STATUS.subscription,
            status: "active",
            pro_active: true,
          },
          entitlements: [...DEFAULT_PRO_STATUS.entitlements, "no_ads"],
        }),
      ),
    );

    renderWithProviders(<InlineBannerAd placement="stats" />);

    await waitFor(() => {
      expect(screen.queryByLabelText("mock-banner-ad")).toBeNull();
    });
  });
});
