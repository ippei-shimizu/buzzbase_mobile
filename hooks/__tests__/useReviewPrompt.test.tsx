/**
 * ポジティブイベントからストアレビューダイアログを要求するまでの判定の振る舞いテスト。
 * 永続化層（SecureStore）はメモリ上の Map、OS のダイアログは expo-store-review のモックで観測する。
 */
import { act, renderHook } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { useReviewPrompt } from "../useReviewPrompt";

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  isPostHogEnabled: true,
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

const storage = new Map<string, string>();

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const seed = (values: Record<string, string>) => {
  Object.entries(values).forEach(([key, value]) => storage.set(key, value));
};

const requestReviewMock = StoreReview.requestReview as jest.Mock;

const triggerShare = async () => {
  const { result } = renderHook(() => useReviewPrompt());
  let requested = false;
  await act(async () => {
    requested = await result.current.triggerPositiveEvent({
      trigger: "shared",
    });
  });
  return requested;
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.clear();
  (SecureStore.getItemAsync as jest.Mock).mockImplementation(
    async (key: string) => storage.get(key) ?? null,
  );
  (SecureStore.setItemAsync as jest.Mock).mockImplementation(
    async (key: string, value: string) => {
      storage.set(key, value);
    },
  );
  (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  requestReviewMock.mockResolvedValue(undefined);
});

describe("useReviewPrompt", () => {
  it("インストール直後にマイルストーンを通過しても、猶予期間が明けた次のイベントで要求する", async () => {
    seed({
      store_review_positive_event_count: "1",
      store_review_install_date: daysAgo(3),
    });
    expect(await triggerShare()).toBe(false);

    seed({ store_review_install_date: daysAgo(10) });
    expect(await triggerShare()).toBe(true);
    expect(requestReviewMock).toHaveBeenCalledTimes(1);
  });

  it("要求したマイルストーンは消化され、次のマイルストーンに届くまで再要求しない", async () => {
    seed({
      store_review_positive_event_count: "1",
      store_review_install_date: daysAgo(30),
    });
    expect(await triggerShare()).toBe(true);

    seed({ store_review_last_shown: daysAgo(100) });
    expect(await triggerShare()).toBe(false);

    seed({ store_review_positive_event_count: "4" });
    expect(await triggerShare()).toBe(true);
    expect(requestReviewMock).toHaveBeenCalledTimes(2);
  });

  it("複数のマイルストーンを跨いでいても、1回の要求でまとめて消化する", async () => {
    seed({
      store_review_positive_event_count: "29",
      store_review_install_date: daysAgo(30),
    });
    expect(await triggerShare()).toBe(true);

    seed({ store_review_last_shown: daysAgo(100) });
    expect(await triggerShare()).toBe(false);
    expect(requestReviewMock).toHaveBeenCalledTimes(1);
  });

  it("前回の要求から60日未満は要求せず、60日経過後に要求する", async () => {
    seed({
      store_review_positive_event_count: "4",
      store_review_install_date: daysAgo(365),
      store_review_consumed_milestone: "2",
      store_review_shown_count: "1",
      store_review_shown_year: String(new Date().getFullYear()),
      store_review_last_shown: daysAgo(59),
    });
    expect(await triggerShare()).toBe(false);

    seed({ store_review_last_shown: daysAgo(60) });
    expect(await triggerShare()).toBe(true);
  });

  it("直近365日に3回要求していたら、年をまたいでいても要求しない", async () => {
    seed({
      store_review_positive_event_count: "4",
      store_review_install_date: daysAgo(730),
      store_review_consumed_milestone: "2",
      store_review_shown_at_list: JSON.stringify([
        daysAgo(300),
        daysAgo(200),
        daysAgo(100),
      ]),
      store_review_last_shown: daysAgo(100),
    });
    expect(await triggerShare()).toBe(false);
    expect(requestReviewMock).not.toHaveBeenCalled();
  });

  it("365日より前の要求は回数に数えない", async () => {
    seed({
      store_review_positive_event_count: "4",
      store_review_install_date: daysAgo(730),
      store_review_consumed_milestone: "2",
      store_review_shown_at_list: JSON.stringify([
        daysAgo(400),
        daysAgo(200),
        daysAgo(100),
      ]),
      store_review_last_shown: daysAgo(100),
    });
    expect(await triggerShare()).toBe(true);
  });

  it("暦年カウントで当年に3回要求済みの端末では要求しない", async () => {
    seed({
      store_review_positive_event_count: "4",
      store_review_install_date: daysAgo(730),
      store_review_consumed_milestone: "2",
      store_review_shown_count: "3",
      store_review_shown_year: String(new Date().getFullYear()),
      store_review_last_shown: daysAgo(100),
    });
    expect(await triggerShare()).toBe(false);
    expect(requestReviewMock).not.toHaveBeenCalled();
  });

  it("要求に失敗したマイルストーンは消化せず、次のイベントで再び要求する", async () => {
    seed({
      store_review_positive_event_count: "1",
      store_review_install_date: daysAgo(30),
    });
    requestReviewMock.mockRejectedValueOnce(new Error("native error"));
    expect(await triggerShare()).toBe(false);

    expect(await triggerShare()).toBe(true);
    expect(requestReviewMock).toHaveBeenCalledTimes(2);
  });

  it("要求後の記録に失敗しても要求済みとして扱い、同じマイルストーンで再要求しない", async () => {
    seed({
      store_review_positive_event_count: "1",
      store_review_install_date: daysAgo(30),
    });
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        if (key === "store_review_last_shown") throw new Error("write error");
        storage.set(key, value);
      },
    );
    expect(await triggerShare()).toBe(true);

    expect(await triggerShare()).toBe(false);
    expect(requestReviewMock).toHaveBeenCalledTimes(1);
  });

  it("要求したときだけ、トリガー種別付きで計測する", async () => {
    seed({
      store_review_positive_event_count: "0",
      store_review_install_date: daysAgo(30),
    });
    await triggerShare();
    expect(mockCapture).not.toHaveBeenCalled();

    await triggerShare();
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith("store review requested", {
      trigger: "shared",
    });
  });
});
