import { act, renderHook, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { useOnboarding } from "../useOnboarding";

const getItemAsyncMock = SecureStore.getItemAsync as jest.Mock;
const setItemAsyncMock = SecureStore.setItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useOnboarding", () => {
  it("フラグ未設定なら読み込み後に isCompleted が false になる", async () => {
    getItemAsyncMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isCompleted).toBeNull();
    await waitFor(() => {
      expect(result.current.isCompleted).toBe(false);
    });
  });

  it("フラグが立っていれば isCompleted が true になる", async () => {
    getItemAsyncMock.mockResolvedValueOnce("1");

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isCompleted).toBe(true);
    });
  });

  it("complete() でフラグを永続化し isCompleted が true になる", async () => {
    getItemAsyncMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOnboarding());
    await waitFor(() => {
      expect(result.current.isCompleted).toBe(false);
    });

    await act(async () => {
      await result.current.complete();
    });

    expect(setItemAsyncMock).toHaveBeenCalledWith("onboarding_completed", "1");
    expect(result.current.isCompleted).toBe(true);
  });
});
