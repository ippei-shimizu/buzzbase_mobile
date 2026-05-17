/**
 * useEntitlement フックの結合テスト。
 *
 * 方針:
 * - HTTP 層を MSW で intercept し、サービス関数の jest.mock を使わない。
 * - back の Entitlement#has_entitlement? と同じ判定を表現していることを、
 *   公開 API（hasEntitlement / isPro / inTrial / inGracePeriod）から検証する。
 */
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";
import {
  DEFAULT_PRO_STATUS,
  FREE_FEATURES,
  type ProStatus,
} from "../../types/pro";
import { useEntitlement } from "../useEntitlement";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
};

const respondWithProStatus = (proStatus: ProStatus) => {
  server.use(
    http.get(apiUrl("/pro/status"), () => HttpResponse.json(proStatus)),
  );
};

describe("useEntitlement", () => {
  describe("無料ユーザー (status: free)", () => {
    it("無料機能には true、Pro 機能には false を返す", async () => {
      respondWithProStatus(DEFAULT_PRO_STATUS);

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPro).toBe(false));

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("calculation_tools")).toBe(true);
      expect(result.current.hasEntitlement("no_ads")).toBe(false);
      expect(result.current.hasEntitlement("unlimited_practice_menus")).toBe(
        false,
      );
    });
  });

  describe("Pro ユーザー (status: active)", () => {
    const proActive: ProStatus = {
      subscription: {
        status: "active",
        plan_type: "monthly",
        platform: "ios",
        started_at: "2026-04-01T00:00:00+09:00",
        expires_at: "2026-06-01T00:00:00+09:00",
        in_trial: false,
        in_grace_period: false,
        days_remaining: 14,
        is_early_subscriber: false,
        has_used_trial: true,
      },
      entitlements: [
        ...FREE_FEATURES,
        "no_ads",
        "season_transition_graph",
        "unlimited_practice_menus",
      ],
    };

    it("無料機能・Pro 機能のいずれも entitlements に含まれていれば true を返す", async () => {
      respondWithProStatus(proActive);

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPro).toBe(true));

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("no_ads")).toBe(true);
      expect(result.current.hasEntitlement("season_transition_graph")).toBe(
        true,
      );
    });

    it("entitlements に含まれない Pro 機能には false を返す", async () => {
      respondWithProStatus(proActive);

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPro).toBe(true));

      expect(result.current.hasEntitlement("detailed_condition_log")).toBe(
        false,
      );
    });
  });

  describe("トライアル中ユーザー", () => {
    it("inTrial: true、isPro: true を返す", async () => {
      respondWithProStatus({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "trial",
          in_trial: true,
          expires_at: "2026-06-01T00:00:00+09:00",
          days_remaining: 7,
        },
        entitlements: [...FREE_FEATURES, "no_ads"],
      });

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPro).toBe(true));

      expect(result.current.inTrial).toBe(true);
      expect(result.current.inGracePeriod).toBe(false);
    });
  });

  describe("グレースピリオド中ユーザー (cancelled)", () => {
    it("inGracePeriod: true、isPro: true を返す", async () => {
      respondWithProStatus({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "cancelled",
          in_grace_period: true,
          expires_at: "2026-06-01T00:00:00+09:00",
          days_remaining: 5,
        },
        entitlements: [...FREE_FEATURES, "no_ads"],
      });

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPro).toBe(true));

      expect(result.current.inGracePeriod).toBe(true);
    });
  });
});
