import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import AccountDeletionScreen from "../account-deletion";

const mockPush = jest.fn();
const mockLogout = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@hooks/useAuth", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

jest.mock("@services/profileService", () => ({
  deleteAccount: () => mockDeleteAccount(),
}));

// Alert のボタン配列から指定ラベルのボタンを取り出すヘルパー。
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
    mockDeleteAccount.mockResolvedValue(undefined);
    render(<AccountDeletionScreen />);

    await confirmDelete();

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
  });

  it("pro_active エラー時は解約導線付きの専用ダイアログを表示する", async () => {
    mockDeleteAccount.mockRejectedValue({
      isAxiosError: true,
      response: { data: { success: false, error: "pro_active" } },
    });
    render(<AccountDeletionScreen />);

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
    mockDeleteAccount.mockRejectedValue(new Error("network error"));
    render(<AccountDeletionScreen />);

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
