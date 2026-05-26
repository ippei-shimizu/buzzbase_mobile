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
  it("API が true を返したら true", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ pro_features: true }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("API が false を返したら false", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ pro_features: false }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it("API がキーを含めず返したら false（未定義は安全側で false 扱い）", async () => {
    server.use(http.get(apiUrl("/feature_flags"), () => HttpResponse.json({})));

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    // 初期は data 未取得で false。取得完了後も {} なので false 維持。
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("API が 500 エラーでも false（取得失敗は安全側で false 扱い）", async () => {
    server.use(
      http.get(apiUrl("/feature_flags"), () =>
        HttpResponse.json({ error: "internal" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag("pro_features"), {
      wrapper: createWrapper(),
    });

    // 初期から最後まで false のまま
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
