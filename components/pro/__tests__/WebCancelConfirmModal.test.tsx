/**
 * Web(Stripe)加入者向け解約確認モーダルの振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
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

  it("解約リクエスト中は背景タップで閉じない", async () => {
    server.use(
      http.delete(apiUrl("/pro/subscription"), async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ message: "ok" });
      }),
    );

    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByText("解約する"));
    await waitFor(() => {
      expect(screen.queryByText("解約する")).toBeNull();
    });
    fireEvent.press(screen.getByLabelText("モーダルを閉じる"));

    expect(onClose).not.toHaveBeenCalled();
    await screen.findByText("解約申請を受け付けました");
  });

  it("閉じるを押すとonCloseが呼ばれる", () => {
    renderWithProviders(<WebCancelConfirmModal isOpen onClose={onClose} />);

    fireEvent.press(screen.getByText("閉じる"));

    expect(onClose).toHaveBeenCalled();
  });
});
