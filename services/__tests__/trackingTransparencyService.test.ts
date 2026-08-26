/**
 * ATT 許可ダイアログの振る舞いテスト。
 * アプリ側に表示済みフラグを持たず、OS が返す status だけで表示要否を決めることを検証する。
 * フラグを永続化すると Keychain がアプリ削除後も残り、再インストールしても
 * ダイアログを二度と出せなくなるため、この不変条件を壊さないよう固定する。
 */
import * as TrackingTransparency from "expo-tracking-transparency";
import { requestTrackingPermissionOnce } from "../trackingTransparencyService";

jest.mock("expo-tracking-transparency", () => ({
  isAvailable: jest.fn(() => true),
  getTrackingPermissionsAsync: jest.fn(),
  requestTrackingPermissionsAsync: jest.fn(),
}));

const isAvailable = TrackingTransparency.isAvailable as jest.Mock;
const getPermissions =
  TrackingTransparency.getTrackingPermissionsAsync as jest.Mock;
const requestPermissions =
  TrackingTransparency.requestTrackingPermissionsAsync as jest.Mock;

describe("requestTrackingPermissionOnce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isAvailable.mockReturnValue(true);
    requestPermissions.mockResolvedValue({ status: "granted" });
  });

  it("未回答のときは許可ダイアログを表示する", async () => {
    getPermissions.mockResolvedValue({ status: "undetermined" });

    await requestTrackingPermissionOnce();

    expect(requestPermissions).toHaveBeenCalledTimes(1);
  });

  it("すでに拒否されているときは再表示しない", async () => {
    getPermissions.mockResolvedValue({ status: "denied" });

    await requestTrackingPermissionOnce();

    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it("すでに許可されているときは再表示しない", async () => {
    getPermissions.mockResolvedValue({ status: "granted" });

    await requestTrackingPermissionOnce();

    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it("ATT が利用できない環境では status も問い合わせない", async () => {
    isAvailable.mockReturnValue(false);

    await requestTrackingPermissionOnce();

    expect(getPermissions).not.toHaveBeenCalled();
    expect(requestPermissions).not.toHaveBeenCalled();
  });
});
