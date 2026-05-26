import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import { CancelGuideModal } from "../CancelGuideModal";

describe("CancelGuideModal", () => {
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    openURLSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(undefined as unknown as boolean);
  });

  afterEach(() => {
    openURLSpy.mockRestore();
  });

  it("isOpen=false なら本文を描画しない", () => {
    const { queryByText } = render(
      <CancelGuideModal isOpen={false} onClose={jest.fn()} />,
    );

    expect(queryByText("Pro プランの解約方法")).toBeNull();
  });

  it("isOpen=true で 4 ステップの手順を表示する", () => {
    const { getByText } = render(
      <CancelGuideModal isOpen onClose={jest.fn()} />,
    );

    expect(getByText("Pro プランの解約方法")).toBeTruthy();
    expect(getByText("1. 設定アプリを開く")).toBeTruthy();
    expect(getByText("2. 上部のあなたの名前（Apple ID）をタップ")).toBeTruthy();
    expect(getByText("3.「サブスクリプション」をタップ")).toBeTruthy();
    expect(getByText("4.「BUZZ BASE Pro」を選び、解約を完了")).toBeTruthy();
  });

  it("「設定アプリを開く」で Apple サブスクリプション URL を開き、onClose も呼ぶ", () => {
    const onClose = jest.fn();

    const { getByLabelText } = render(
      <CancelGuideModal isOpen onClose={onClose} />,
    );

    fireEvent.press(getByLabelText("Apple サブスクリプション設定を開く"));

    expect(openURLSpy).toHaveBeenCalledWith(
      "https://apps.apple.com/account/subscriptions",
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("「閉じる」で onClose のみ呼ぶ（外部 URL は開かない）", () => {
    const onClose = jest.fn();

    const { getByLabelText } = render(
      <CancelGuideModal isOpen onClose={onClose} />,
    );

    fireEvent.press(getByLabelText("閉じる"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(openURLSpy).not.toHaveBeenCalled();
  });
});
