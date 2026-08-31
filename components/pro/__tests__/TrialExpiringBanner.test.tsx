import type { ProSubscription } from "../../../types/pro";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { StyleSheet } from "react-native";
import { useTrialBannerDismissed } from "../../../hooks/useTrialBannerDismissed";
import { TrialExpiringBanner } from "../TrialExpiringBanner";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

// 上部インセットの加算を検証するため、jest-setup.ts の top: 0 固定モックを上書きする。
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  dismissAll: jest.Mock;
}

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

const baseSubscription: ProSubscription = {
  status: "trial",
  plan_type: "monthly",
  platform: "ios",
  started_at: null,
  expires_at: "2026-09-01T00:00:00Z",
  pro_active: true,
  in_trial: true,
  in_grace_period: false,
  days_remaining: 1,
  is_early_subscriber: false,
  has_used_trial: false,
};

// (tabs)/_layout と同じく、閉じた状態のフックを親で購読してバナーに渡す構成を再現する
function BannerHarness({ subscription }: { subscription: ProSubscription }) {
  const { dismissed, dismiss } = useTrialBannerDismissed(
    subscription.expires_at,
  );
  return (
    <TrialExpiringBanner
      subscription={subscription}
      dismissed={dismissed}
      onDismiss={dismiss}
    />
  );
}

// 閉じた状態の永続化と再マウント時の復元を検証するためのインメモリストア
const secureStoreValues = new Map<string, string>();
const getItemAsyncMock = SecureStore.getItemAsync as jest.Mock;
const setItemAsyncMock = SecureStore.setItemAsync as jest.Mock;

const renderBanner = async (subscription: ProSubscription) => {
  const result = render(<BannerHarness subscription={subscription} />);
  // SecureStore の読み込み確定を待つ（確定前はバナーを描画しない仕様）
  await waitFor(() => {
    expect(getItemAsyncMock).toHaveBeenCalled();
  });
  return result;
};

describe("TrialExpiringBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    secureStoreValues.clear();
    getItemAsyncMock.mockImplementation(
      async (key: string) => secureStoreValues.get(key) ?? null,
    );
    setItemAsyncMock.mockImplementation(async (key: string, value: string) => {
      secureStoreValues.set(key, value);
    });
  });

  it("in_trial かつ残り 1 日ならバナーを表示する", async () => {
    const { findByText } = await renderBanner(baseSubscription);

    expect(await findByText("トライアルはあと 1 日で終了します")).toBeTruthy();
  });

  it("残り 2 日以上なら描画しない", async () => {
    const { queryByText } = await renderBanner({
      ...baseSubscription,
      days_remaining: 2,
    });

    await waitFor(() => {
      expect(queryByText(/トライアルはあと/)).toBeNull();
    });
  });

  it("in_trial=false なら描画しない（残り日数を満たしていても）", async () => {
    const { queryByText } = await renderBanner({
      ...baseSubscription,
      in_trial: false,
    });

    await waitFor(() => {
      expect(queryByText(/トライアルはあと/)).toBeNull();
    });
  });

  it("days_remaining が null なら描画しない", async () => {
    const { queryByText } = await renderBanner({
      ...baseSubscription,
      days_remaining: null,
    });

    await waitFor(() => {
      expect(queryByText(/トライアルはあと/)).toBeNull();
    });
  });

  it("expires_at が null なら描画しない（閉じられないバナーを出さない）", async () => {
    const { queryByText } = await renderBanner({
      ...baseSubscription,
      expires_at: null,
    });

    await waitFor(() => {
      expect(queryByText(/トライアルはあと/)).toBeNull();
    });
  });

  it("閉じた状態が確定するまで描画しない", () => {
    // 読み込みを未解決のままにして確定前の状態を固定する
    getItemAsyncMock.mockImplementation(() => new Promise(() => {}));

    const { queryByText } = render(
      <BannerHarness subscription={baseSubscription} />,
    );

    expect(queryByText(/トライアルはあと/)).toBeNull();
  });

  it("タップで /account/subscription に push する", async () => {
    const { findByText } = await renderBanner(baseSubscription);

    fireEvent.press(await findByText("トライアルはあと 1 日で終了します"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/account/subscription");
  });

  it("閉じるボタンで非表示になり、再マウントしても表示されない", async () => {
    const first = await renderBanner(baseSubscription);

    fireEvent.press(
      await first.findByLabelText("トライアル期限の予告を閉じる"),
    );

    await waitFor(() => {
      expect(first.queryByText(/トライアルはあと/)).toBeNull();
    });

    first.unmount();

    // 端末ローカルに永続化されるため、再マウント（アプリ再起動相当）でも表示されない
    const second = await renderBanner(baseSubscription);
    await waitFor(() => {
      expect(getItemAsyncMock).toHaveBeenCalled();
    });
    expect(second.queryByText(/トライアルはあと/)).toBeNull();
  });

  it("閉じた後でも expires_at が変わったら（再加入）再び表示される", async () => {
    const first = await renderBanner(baseSubscription);
    fireEvent.press(
      await first.findByLabelText("トライアル期限の予告を閉じる"),
    );
    first.unmount();

    const second = await renderBanner({
      ...baseSubscription,
      expires_at: "2026-12-01T00:00:00Z",
    });

    expect(
      await second.findByText("トライアルはあと 1 日で終了します"),
    ).toBeTruthy();
  });

  it("バナーの上部パディングにセーフエリアの上部インセットを加算する", async () => {
    const { findByLabelText } = await renderBanner(baseSubscription);

    const style = StyleSheet.flatten(
      (await findByLabelText("トライアル期限の予告")).props.style,
    );
    expect(style.paddingTop).toBe(57);
    expect(style.paddingBottom).toBe(10);
  });
});
