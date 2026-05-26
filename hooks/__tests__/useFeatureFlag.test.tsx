import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { createTestQueryClient } from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import { useFeatureFlag } from "../useFeatureFlag";

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
};

describe("useFeatureFlag", () => {
  it("API が true を返したら enabled=true / isLoading=false", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ pro_features: true }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.isLoading).toBe(false);
  });

  it("API が false を返したら enabled=false / isLoading=false", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ pro_features: false }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.enabled).toBe(false);
  });

  it("API がキーを含めず返したら enabled=false（未定義は安全側）", async () => {
    server.use(http.get(apiUrl("/feature_flags"), () => HttpResponse.json({})));

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.enabled).toBe(false);
  });

  it("API が 500 エラーでも enabled=false（取得失敗は安全側）", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ error: "internal" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.enabled).toBe(false);
  });

  it("初回マウント直後は isLoading=true", () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ pro_features: true }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.enabled).toBe(false);
  });
});
