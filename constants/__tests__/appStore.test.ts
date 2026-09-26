import { buildAppStoreUrl } from "../appStore";

/**
 * App Store Connect の「キャンペーンリンクを作成」で campaign に smart_banner を入れたときに発行された URL。
 * この形式から外れると App Analytics のキャンペーンに集計されなくなる。
 */
const CAMPAIGN_LINK_ISSUED_BY_APP_STORE_CONNECT =
  "https://apps.apple.com/app/apple-store/id6761011816?pt=128690561&ct=smart_banner&mt=8";

describe("buildAppStoreUrl", () => {
  it("App Store Connect が発行するキャンペーンリンクと同じ URL を返す", () => {
    expect(buildAppStoreUrl("smart_banner")).toBe(
      CAMPAIGN_LINK_ISSUED_BY_APP_STORE_CONNECT,
    );
  });

  it("campaign 名に URL の区切り文字が含まれてもクエリを壊さない", () => {
    const url = new URL(buildAppStoreUrl("a&b=c"));

    expect(url.searchParams.get("ct")).toBe("a&b=c");
    expect(url.searchParams.get("pt")).toBe("128690561");
    expect(url.searchParams.get("mt")).toBe("8");
  });
});
