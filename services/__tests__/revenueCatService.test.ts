import Purchases from "react-native-purchases";
import {
  __resetConfiguredForTest,
  configureRevenueCat,
  getCustomerInfo,
  getOfferings,
  loginRevenueCat,
  logoutRevenueCat,
  purchasePackage,
} from "../revenueCatService";

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    purchasePackage: jest.fn(),
  },
}));

const PurchasesMock = Purchases as unknown as {
  configure: jest.Mock;
  logIn: jest.Mock;
  logOut: jest.Mock;
  getOfferings: jest.Mock;
  getCustomerInfo: jest.Mock;
  purchasePackage: jest.Mock;
};

describe("revenueCatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetConfiguredForTest();
  });

  describe("configureRevenueCat", () => {
    it("Purchases.configure を渡された apiKey で呼ぶ", () => {
      configureRevenueCat("appl_test_key");
      expect(PurchasesMock.configure).toHaveBeenCalledWith({
        apiKey: "appl_test_key",
      });
    });

    it("二度呼んでも Purchases.configure は 1 度しか実行されない", () => {
      configureRevenueCat("appl_test_key");
      configureRevenueCat("appl_test_key");
      expect(PurchasesMock.configure).toHaveBeenCalledTimes(1);
    });
  });

  describe("loginRevenueCat / logoutRevenueCat", () => {
    it("configure 未実行のときは Purchases.logIn を呼ばない", async () => {
      await loginRevenueCat("123");
      expect(PurchasesMock.logIn).not.toHaveBeenCalled();
    });

    it("configure 後は Purchases.logIn を userId 付きで呼ぶ", async () => {
      configureRevenueCat("appl_test_key");
      await loginRevenueCat("123");
      expect(PurchasesMock.logIn).toHaveBeenCalledWith("123");
    });

    it("configure 未実行のときは Purchases.logOut を呼ばない", async () => {
      await logoutRevenueCat();
      expect(PurchasesMock.logOut).not.toHaveBeenCalled();
    });

    it("configure 後は Purchases.logOut を呼ぶ", async () => {
      configureRevenueCat("appl_test_key");
      await logoutRevenueCat();
      expect(PurchasesMock.logOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("getOfferings", () => {
    it("configure 未実行のときは null を返し SDK を呼ばない", async () => {
      const result = await getOfferings();
      expect(result).toBeNull();
      expect(PurchasesMock.getOfferings).not.toHaveBeenCalled();
    });

    it("configure 後は offerings.current を返す", async () => {
      configureRevenueCat("appl_test_key");
      const offering = { identifier: "default", availablePackages: [] };
      PurchasesMock.getOfferings.mockResolvedValueOnce({ current: offering });

      const result = await getOfferings();

      expect(result).toBe(offering);
    });

    it("offerings.current が無い場合は null を返す", async () => {
      configureRevenueCat("appl_test_key");
      PurchasesMock.getOfferings.mockResolvedValueOnce({ current: null });

      const result = await getOfferings();

      expect(result).toBeNull();
    });
  });

  describe("getCustomerInfo", () => {
    it("configure 未実行のときは null を返す", async () => {
      const result = await getCustomerInfo();
      expect(result).toBeNull();
      expect(PurchasesMock.getCustomerInfo).not.toHaveBeenCalled();
    });

    it("configure 後は SDK の戻り値をそのまま返す", async () => {
      configureRevenueCat("appl_test_key");
      const info = { entitlements: { active: {} } };
      PurchasesMock.getCustomerInfo.mockResolvedValueOnce(info);

      const result = await getCustomerInfo();

      expect(result).toBe(info);
    });
  });

  describe("purchasePackage", () => {
    it("SDK の purchasePackage に渡し customerInfo を返す", async () => {
      const pkg = { identifier: "monthly" };
      const info = { entitlements: { active: { pro: {} } } };
      PurchasesMock.purchasePackage.mockResolvedValueOnce({
        customerInfo: info,
      });

      const result = await purchasePackage(
        pkg as unknown as Parameters<typeof purchasePackage>[0],
      );

      expect(PurchasesMock.purchasePackage).toHaveBeenCalledWith(pkg);
      expect(result).toBe(info);
    });

    it("ユーザーキャンセル例外はそのまま re-throw する", async () => {
      const error = Object.assign(new Error("cancelled"), {
        userCancelled: true,
      });
      PurchasesMock.purchasePackage.mockRejectedValueOnce(error);

      await expect(
        purchasePackage({} as unknown as Parameters<typeof purchasePackage>[0]),
      ).rejects.toBe(error);
    });
  });
});
