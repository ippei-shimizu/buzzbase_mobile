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

type RevenueCatService = typeof import("../revenueCatService");

interface PurchasesMock {
  configure: jest.Mock;
  logIn: jest.Mock;
  logOut: jest.Mock;
  getOfferings: jest.Mock;
  getCustomerInfo: jest.Mock;
  purchasePackage: jest.Mock;
}

// jest.resetModules() で revenueCatService をリセットすると、react-native-purchases も
// 再評価されて jest.mock factory が新しい jest.fn() インスタンスを生成する。
// service 内部参照とテスト参照を一致させるため、毎回同時に require で取り直す。
const loadServiceAndMock = (): {
  service: RevenueCatService;
  Purchases: PurchasesMock;
} => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const service = require("../revenueCatService") as RevenueCatService;

  const Purchases = (
    require("react-native-purchases") as { default: PurchasesMock }
  ).default;
  return { service, Purchases };
};

describe("revenueCatService", () => {
  let service: RevenueCatService;
  let Purchases: PurchasesMock;

  beforeEach(() => {
    ({ service, Purchases } = loadServiceAndMock());
  });

  describe("configureRevenueCat", () => {
    it("Purchases.configure を渡された apiKey で呼ぶ", () => {
      service.configureRevenueCat("appl_test_key");
      expect(Purchases.configure).toHaveBeenCalledWith({
        apiKey: "appl_test_key",
      });
    });

    it("二度呼んでも Purchases.configure は 1 度しか実行されない", () => {
      service.configureRevenueCat("appl_test_key");
      service.configureRevenueCat("appl_test_key");
      expect(Purchases.configure).toHaveBeenCalledTimes(1);
    });
  });

  describe("loginRevenueCat / logoutRevenueCat", () => {
    it("configure 未実行のときは Purchases.logIn を呼ばない", async () => {
      await service.loginRevenueCat("123");
      expect(Purchases.logIn).not.toHaveBeenCalled();
    });

    it("configure 後は Purchases.logIn を userId 付きで呼ぶ", async () => {
      service.configureRevenueCat("appl_test_key");
      await service.loginRevenueCat("123");
      expect(Purchases.logIn).toHaveBeenCalledWith("123");
    });

    it("configure 未実行のときは Purchases.logOut を呼ばない", async () => {
      await service.logoutRevenueCat();
      expect(Purchases.logOut).not.toHaveBeenCalled();
    });

    it("configure 後は Purchases.logOut を呼ぶ", async () => {
      service.configureRevenueCat("appl_test_key");
      await service.logoutRevenueCat();
      expect(Purchases.logOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("getOfferings", () => {
    it("configure 未実行のときは null を返し SDK を呼ばない", async () => {
      const result = await service.getOfferings();
      expect(result).toBeNull();
      expect(Purchases.getOfferings).not.toHaveBeenCalled();
    });

    it("configure 後は offerings.current を返す", async () => {
      service.configureRevenueCat("appl_test_key");
      const offering = { identifier: "default", availablePackages: [] };
      Purchases.getOfferings.mockResolvedValueOnce({ current: offering });

      const result = await service.getOfferings();

      expect(result).toBe(offering);
    });

    it("offerings.current が無い場合は null を返す", async () => {
      service.configureRevenueCat("appl_test_key");
      Purchases.getOfferings.mockResolvedValueOnce({ current: null });

      const result = await service.getOfferings();

      expect(result).toBeNull();
    });
  });

  describe("getCustomerInfo", () => {
    it("configure 未実行のときは null を返す", async () => {
      const result = await service.getCustomerInfo();
      expect(result).toBeNull();
      expect(Purchases.getCustomerInfo).not.toHaveBeenCalled();
    });

    it("configure 後は SDK の戻り値をそのまま返す", async () => {
      service.configureRevenueCat("appl_test_key");
      const info = { entitlements: { active: {} } };
      Purchases.getCustomerInfo.mockResolvedValueOnce(info);

      const result = await service.getCustomerInfo();

      expect(result).toBe(info);
    });
  });

  describe("purchasePackage", () => {
    it("configure 未実行のときは例外を投げる", async () => {
      await expect(
        service.purchasePackage(
          {} as unknown as Parameters<typeof service.purchasePackage>[0],
        ),
      ).rejects.toThrow("RevenueCat is not configured");
      expect(Purchases.purchasePackage).not.toHaveBeenCalled();
    });

    it("configure 後は SDK の purchasePackage に渡し customerInfo を返す", async () => {
      service.configureRevenueCat("appl_test_key");
      const pkg = { identifier: "monthly" };
      const info = { entitlements: { active: { pro: {} } } };
      Purchases.purchasePackage.mockResolvedValueOnce({
        customerInfo: info,
      });

      const result = await service.purchasePackage(
        pkg as unknown as Parameters<typeof service.purchasePackage>[0],
      );

      expect(Purchases.purchasePackage).toHaveBeenCalledWith(pkg);
      expect(result).toBe(info);
    });

    it("ユーザーキャンセル例外はそのまま re-throw する", async () => {
      service.configureRevenueCat("appl_test_key");
      const error = Object.assign(new Error("cancelled"), {
        userCancelled: true,
      });
      Purchases.purchasePackage.mockRejectedValueOnce(error);

      await expect(
        service.purchasePackage(
          {} as unknown as Parameters<typeof service.purchasePackage>[0],
        ),
      ).rejects.toBe(error);
    });
  });
});
