/**
 * 素振り完了後に練習メニュー一覧が取り直されることの振る舞いテスト。
 * back は初回完了時に「素振り」メニューを自動作成するため、取り直さないと
 * ユーザーには未登録に見えて同名メニューを作成し、重複エラーになる。
 */
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import {
  createTestQueryClient,
  TestProviders,
} from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import { usePracticeMenus } from "../usePracticeMenus";
import { useShadowSwingMutations } from "../useShadowSwing";

describe("useShadowSwingMutations", () => {
  it("素振り完了後に練習メニュー一覧を取り直す", async () => {
    let menuRequests = 0;
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () => {
        menuRequests += 1;
        return HttpResponse.json([]);
      }),
      http.post(baseUrl("/api/v2/shadow_swing_sessions/7/complete"), () =>
        HttpResponse.json({ id: 7, swing_count: 100 }),
      ),
    );
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    );

    const { result } = renderHook(
      () => ({
        menus: usePracticeMenus(),
        mutations: useShadowSwingMutations(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(menuRequests).toBe(1));

    await act(async () => {
      await result.current.mutations.completeSession({
        id: 7,
        swingCount: 100,
      });
    });

    await waitFor(() => expect(menuRequests).toBe(2));
  });
});
