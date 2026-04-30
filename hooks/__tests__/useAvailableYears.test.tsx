import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { getAvailableYears } from "@services/matchResultService";
import { useAvailableYears } from "../useAvailableYears";

jest.mock("@services/matchResultService", () => ({
  getAvailableYears: jest.fn(),
}));

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAvailableYears", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("引数なしで getAvailableYears(undefined) が呼ばれ、自分の年度一覧が返る", async () => {
    (getAvailableYears as jest.Mock).mockResolvedValue(["2024", "2023"]);

    const { result } = renderHook(() => useAvailableYears(), {
      wrapper: buildWrapper(),
    });

    await waitFor(() => expect(result.current.years).toEqual(["2024", "2023"]));
    expect(getAvailableYears).toHaveBeenCalledWith(undefined);
  });

  it("userId 指定で getAvailableYears(userId) が呼ばれ、対象ユーザーの年度一覧が返る", async () => {
    (getAvailableYears as jest.Mock).mockResolvedValue(["2025"]);

    const { result } = renderHook(() => useAvailableYears(123), {
      wrapper: buildWrapper(),
    });

    await waitFor(() => expect(result.current.years).toEqual(["2025"]));
    expect(getAvailableYears).toHaveBeenCalledWith(123);
  });

  it("API 結果待機中は years が空配列、isLoading=true", async () => {
    let resolveQuery!: (value: string[]) => void;
    (getAvailableYears as jest.Mock).mockReturnValue(
      new Promise<string[]>((resolve) => {
        resolveQuery = resolve;
      }),
    );

    const { result } = renderHook(() => useAvailableYears(), {
      wrapper: buildWrapper(),
    });

    expect(result.current.years).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    // Promise を解放してテスト完了時にハンドルを残さない
    resolveQuery([]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
