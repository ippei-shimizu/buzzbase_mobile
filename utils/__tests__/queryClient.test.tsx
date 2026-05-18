/**
 * queryClient のリトライ戦略テスト。
 *
 * 本物の queryClient（retry 関数つき）を使い、axiosInstance + MSW で
 * 「どのエラーで何回リトライされるか」を実際の HTTP 層経由で検証する。
 * 設計意図: services を mock せず HTTP 境界で振る舞いを担保する
 * （.claude/rules/testing.md）。
 */
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { delay } from "msw";
import React from "react";
import {
  http,
  HttpResponse,
  apiUrl,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";

// jest-setup-msw と同じく、setupFiles 完了後に require する。
/* eslint-disable @typescript-eslint/no-require-imports */
const axiosInstance = require("../axiosInstance").default;
const { queryClient } = require("../queryClient");
/* eslint-enable @typescript-eslint/no-require-imports */

const buildWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const runQuery = (key: string) =>
  renderHook(
    () =>
      useQuery({
        queryKey: [key],
        queryFn: () => axiosInstance.get(apiUrl("/ping")),
      }),
    { wrapper: buildWrapper() },
  );

beforeEach(() => {
  queryClient.clear();
});

describe("queryClient リトライ戦略", () => {
  it("4xx (422) はリトライせず 1 回で確定する", async () => {
    let callCount = 0;
    server.use(
      http.get(apiUrl("/ping"), () => {
        callCount += 1;
        return HttpResponse.json({ error: "unprocessable" }, { status: 422 });
      }),
    );

    const { result } = runQuery("test-422");
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(callCount).toBe(1);
  });

  it("5xx (500) は 1 回だけリトライして合計 2 回試行する", async () => {
    let callCount = 0;
    server.use(
      http.get(apiUrl("/ping"), () => {
        callCount += 1;
        return HttpResponse.json({ error: "internal" }, { status: 500 });
      }),
    );

    const { result } = runQuery("test-500");
    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(callCount).toBe(2);
  });

  it("タイムアウト (ECONNABORTED) はリトライせず 1 回で確定する", async () => {
    const originalTimeout = axiosInstance.defaults.timeout;
    axiosInstance.defaults.timeout = 50;
    let callCount = 0;
    server.use(
      http.get(apiUrl("/ping"), async () => {
        callCount += 1;
        await delay(300);
        return HttpResponse.json({ ok: true });
      }),
    );

    try {
      const { result } = runQuery("test-timeout");
      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 5000,
      });
      expect(callCount).toBe(1);
    } finally {
      axiosInstance.defaults.timeout = originalTimeout;
    }
  });

  it("ネットワーク断 (応答なし) は 1 回だけリトライして合計 2 回試行する", async () => {
    let callCount = 0;
    server.use(
      http.get(apiUrl("/ping"), () => {
        callCount += 1;
        return HttpResponse.error();
      }),
    );

    const { result } = runQuery("test-network");
    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(callCount).toBe(2);
  });
});
