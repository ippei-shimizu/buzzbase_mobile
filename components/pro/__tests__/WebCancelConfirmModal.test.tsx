/**
 * Web(Stripe)加入者向け解約確認モーダルの振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as useProMutationsModule from "@hooks/useProMutations";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { WebCancelConfirmModal } from "../WebCancelConfirmModal";

describe("WebCancelConfirmModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("解約するを押すと解約APIを呼び、成功後は完了表示に切り替わる", async () => {
    server.use(
      http.delete(apiUrl("/pro/subscription"), () =>
        HttpResponse.json({ message: "解約申請を受け付けました" }),
      ),
    );

    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByText("解約する"));

    expect(
      await screen.findByText("解約申請を受け付けました"),
    ).toBeOnTheScreen();
  });

  it("解約に失敗するとエラーアラートを表示し、確認画面のままにする", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    server.use(
      http.delete(apiUrl("/pro/subscription"), () =>
        HttpResponse.json({ error: "stripe_api_error" }, { status: 502 }),
      ),
    );

    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByText("解約する"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "解約に失敗しました",
        "しばらくしてから再度お試しください。",
      );
    });
    expect(screen.getByText("Pro プランの解約")).toBeOnTheScreen();
  });

  it("解約リクエスト中は背景タップで閉じない", () => {
    // 実際の非同期リクエストで検証すると、isCancellingがtrueへ切り替わる
    // 再描画のタイミングとテストの操作が競合し不安定になる。ここでは
    // isCancelling=trueを固定した状態のUIだけを対象に、背景タップが
    // ブロックされることを決定的に検証する。
    jest
      .spyOn(useProMutationsModule, "useCancelWebSubscription")
      .mockReturnValue({
        cancelWebSubscription: jest.fn(),
        isCancelling: true,
      });

    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("モーダルを閉じる"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("閉じるを押すとonCloseが呼ばれる", () => {
    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByText("閉じる"));

    expect(onClose).toHaveBeenCalled();
  });
});
