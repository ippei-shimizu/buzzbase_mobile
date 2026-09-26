import { buildAppStoreUrl } from "../appStore";

/**
 * App Store Connect の「キャンペーンリンクを作成」は
 * `https://apps.apple.com/app/apple-store/id6761011816?pt=128690561&ct=<campaign>&mt=8` を発行する。
 * この形式から外れると App Analytics のキャンペーンに集計されなくなる。
 */
describe("buildAppStoreUrl", () => {
  it("App Store Connect が発行するキャンペーンリンクと同じ URL を返す", () => {
    expect(buildAppStoreUrl("share_game_summary")).toBe(
      "https://apps.apple.com/app/apple-store/id6761011816?pt=128690561&ct=share_game_summary&mt=8",
    );
  });
});
