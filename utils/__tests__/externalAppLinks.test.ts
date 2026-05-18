import * as Sentry from "@sentry/react-native";
import { Linking, Platform } from "react-native";
import {
  openExternalUrlPreferringNativeApp,
  resolveXAppUrl,
} from "../externalAppLinks";

const setPlatformOS = (os: "ios" | "android") => {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os,
  });
};

describe("resolveXAppUrl", () => {
  describe("プロフィールURL", () => {
    it.each([
      ["https://x.com/foo", "twitter://user?screen_name=foo"],
      ["https://twitter.com/foo", "twitter://user?screen_name=foo"],
      ["https://www.x.com/foo", "twitter://user?screen_name=foo"],
      ["https://mobile.x.com/foo", "twitter://user?screen_name=foo"],
      ["https://m.x.com/foo", "twitter://user?screen_name=foo"],
      ["https://x.com/foo/", "twitter://user?screen_name=foo"],
      ["https://x.com/foo?ref=bar", "twitter://user?screen_name=foo"],
      ["https://x.com/foo#hash", "twitter://user?screen_name=foo"],
      ["https://X.com/Foo", "twitter://user?screen_name=Foo"],
      // `@` プレフィックス付きユーザー名は剥がして変換する
      ["https://x.com/@foo", "twitter://user?screen_name=foo"],
      ["https://x.com/@@foo", "twitter://user?screen_name=foo"],
    ])("%s -> %s", (input, expected) => {
      expect(resolveXAppUrl(input)).toBe(expected);
    });
  });

  describe("ステータスURL", () => {
    it.each([
      ["https://x.com/foo/status/1234567890", "twitter://status?id=1234567890"],
      [
        "https://twitter.com/foo/status/1234567890",
        "twitter://status?id=1234567890",
      ],
      [
        "https://x.com/foo/statuses/1234567890",
        "twitter://status?id=1234567890",
      ],
      ["https://x.com/foo/status/1234?s=20", "twitter://status?id=1234"],
      ["https://x.com/foo/status/1234/", "twitter://status?id=1234"],
    ])("%s -> %s", (input, expected) => {
      expect(resolveXAppUrl(input)).toBe(expected);
    });
  });

  describe("変換対象外 (null を返す)", () => {
    it.each([
      "https://x.com/home",
      "https://x.com/explore",
      "https://x.com/notifications",
      "https://x.com/messages",
      "https://x.com/search?q=test",
      "https://x.com/compose/tweet",
      "https://x.com/i/lists/123",
      "https://x.com/intent/tweet?text=hello",
      "https://x.com/settings/profile",
      "https://x.com/login",
      "https://x.com/signup",
      "https://x.com/foo/status/abc",
      "https://x.com/",
      "https://x.com",
      // `@` だけ・`@home` 等の予約パスを @ で偽装したケースも null
      "https://x.com/@",
      "https://x.com/@home",
      "https://example.com/foo",
      "https://t.co/abcd",
      "https://buzzbase.jp/contact",
      "javascript:alert(1)",
      "not-a-url",
      "",
    ])("%s -> null", (input) => {
      expect(resolveXAppUrl(input)).toBeNull();
    });
  });
});

describe("openExternalUrlPreferringNativeApp", () => {
  let canOpenSpy: jest.SpyInstance;
  let openSpy: jest.SpyInstance;
  let sentrySpy: jest.SpyInstance;
  const originalOS = Platform.OS;

  beforeEach(() => {
    canOpenSpy = jest.spyOn(Linking, "canOpenURL");
    openSpy = jest.spyOn(Linking, "openURL");
    sentrySpy = jest
      .spyOn(Sentry, "captureException")
      .mockImplementation(() => "test-event-id");
  });

  afterEach(() => {
    canOpenSpy.mockRestore();
    openSpy.mockRestore();
    sentrySpy.mockRestore();
    setPlatformOS(originalOS as "ios" | "android");
  });

  describe("iOS", () => {
    beforeEach(() => setPlatformOS("ios"));

    it("Xアプリで開けるときは twitter:// スキームで openURL を呼ぶ", async () => {
      canOpenSpy.mockResolvedValue(true);
      openSpy.mockResolvedValue(true);

      openExternalUrlPreferringNativeApp("https://x.com/foo", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(canOpenSpy).toHaveBeenCalledWith("twitter://user?screen_name=foo");
      expect(openSpy).toHaveBeenCalledWith("twitter://user?screen_name=foo");
      expect(openSpy).not.toHaveBeenCalledWith("https://x.com/foo");
    });

    it("Xアプリ未インストール時は https URL にフォールバックする", async () => {
      canOpenSpy.mockResolvedValue(false);
      openSpy.mockResolvedValue(true);

      openExternalUrlPreferringNativeApp("https://x.com/foo", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(openSpy).toHaveBeenCalledWith("https://x.com/foo");
      expect(openSpy).not.toHaveBeenCalledWith(
        "twitter://user?screen_name=foo",
      );
    });

    it("X以外のURLは canOpenURL を呼ばず直接 openURL する", async () => {
      openSpy.mockResolvedValue(true);

      openExternalUrlPreferringNativeApp("https://buzzbase.jp/contact", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(canOpenSpy).not.toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith("https://buzzbase.jp/contact");
    });

    it("canOpenURL=true でも openURL 自体が失敗した場合は https にフォールバックし Sentry に通知する", async () => {
      canOpenSpy.mockResolvedValue(true);
      openSpy
        .mockRejectedValueOnce(new Error("scheme open failed"))
        .mockResolvedValueOnce(true);

      openExternalUrlPreferringNativeApp("https://x.com/foo", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(openSpy).toHaveBeenNthCalledWith(
        1,
        "twitter://user?screen_name=foo",
      );
      expect(openSpy).toHaveBeenNthCalledWith(2, "https://x.com/foo");
      expect(sentrySpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            source: "notification-detail",
            action: "open-x-app-url",
          }),
        }),
      );
    });
  });

  describe("Android", () => {
    beforeEach(() => setPlatformOS("android"));

    it("Xアプリスキームを直接 openURL し、成功時はフォールバックしない", async () => {
      openSpy.mockResolvedValue(true);

      openExternalUrlPreferringNativeApp("https://x.com/foo", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(canOpenSpy).not.toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith("twitter://user?screen_name=foo");
    });

    it("twitter:// が失敗したら https URL にフォールバックし Sentry に通知する", async () => {
      openSpy
        .mockRejectedValueOnce(new Error("no activity"))
        .mockResolvedValueOnce(true);

      openExternalUrlPreferringNativeApp("https://x.com/foo", {
        source: "notification-detail",
      });
      await flushPromises();

      expect(openSpy).toHaveBeenNthCalledWith(
        1,
        "twitter://user?screen_name=foo",
      );
      expect(openSpy).toHaveBeenNthCalledWith(2, "https://x.com/foo");
      expect(sentrySpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            source: "notification-detail",
            action: "open-x-app-url",
          }),
        }),
      );
    });
  });

  it("https フォールバックも失敗した場合は Sentry に2回通知される", async () => {
    setPlatformOS("android");
    openSpy
      .mockRejectedValueOnce(new Error("no activity"))
      .mockRejectedValueOnce(new Error("network"));

    openExternalUrlPreferringNativeApp("https://x.com/foo", {
      source: "notification-detail",
    });
    await flushPromises();

    expect(sentrySpy).toHaveBeenCalledTimes(2);
    expect(sentrySpy).toHaveBeenNthCalledWith(
      2,
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          action: "open-external-url-fallback",
        }),
      }),
    );
  });
});

const flushPromises = () =>
  new Promise<void>((resolve) => setImmediate(resolve));
