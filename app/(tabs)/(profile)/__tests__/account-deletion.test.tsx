import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import AccountDeletionScreen from "../account-deletion";

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@hooks/useAuth", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

// DELETE /user のレスポンスを差し替える。削除APIの結果ごとの UI 分岐を検証する。
const stubDeleteAccount = (
  responder: () => Response,
): { get callCount(): number } => {
  let calledCount = 0;
  server.use(
    http.delete(apiUrl("/user"), () => {
      calledCount += 1;
      return responder();
    }),
  );
  return {
    get callCount() {
      return calledCount;
    },
  };
};

// Alert のボタン配列から指定ラベルのボタンを取り出す。
const getAlertButton = (label: string) => {
  const alertCalls = (Alert.alert as jest.Mock).mock.calls;
  const lastCall = alertCalls[alertCalls.length - 1];
  const buttons = lastCall[2] as { text?: string; onPress?: () => void }[];
  return buttons.find((b) => b.text === label);
};

// 確認ダイアログの「削除する」を押して削除処理を発火させる。
const confirmDelete = async () => {
  fireEvent.press(screen.getByText("アカウントを削除する"));
  await act(async () => {
    await getAlertButton("削除する")?.onPress?.();
  });
};

describe("AccountDeletionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("削除成功時は logout まで実行する", async () => {
    const tracker = stubDeleteAccount(
      () => new HttpResponse(null, { status: 200 }),
    );
    renderWithProviders(<AccountDeletionScreen />);

    await confirmDelete();

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(tracker.callCount).toBe(1);
  });

  it("pro_active エラー時は解約導線付きの専用ダイアログを表示する", async () => {
    stubDeleteAccount(() =>
      HttpResponse.json(
        {
          success: false,
          error: "pro_active",
          message: "Pro 加入中のため、先に解約してください",
        },
        { status: 422 },
      ),
    );
    renderWithProviders(<AccountDeletionScreen />);

    await confirmDelete();

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "削除できません",
        "Pro 加入中のため、先に解約してください。",
        expect.any(Array),
      ),
    );

    getAlertButton("解約する")?.onPress?.();
    expect(mockPush).toHaveBeenCalledWith("/account/subscription");
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("pro_active 以外のエラー時は汎用エラーダイアログを表示する", async () => {
    stubDeleteAccount(() =>
      HttpResponse.json({ error: "internal_server_error" }, { status: 500 }),
    );
    renderWithProviders(<AccountDeletionScreen />);

    await confirmDelete();

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "アカウントの削除に失敗しました",
      ),
    );
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
