/**
 * 素振り完了後に練習メニュー一覧が取り直されることの振る舞いテスト。
 * back は初回完了時に「素振り」メニューを自動作成するため、取り直さないと
 * ユーザーには未登録に見えて同名メニューを作成し、重複エラーになる。
 */
import type { PracticeMenu } from "../../types/practice";
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

const shadowSwingMenu: PracticeMenu = {
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: null,
  sort_order: 0,
};

describe("useShadowSwingMutations", () => {
  it("素振り完了後、練習メニュー一覧に自動作成された「素振り」が現れる", async () => {
    let isCompleted = false;
    server.use(
      http.get(baseUrl("/api/v2/practice_menus"), () =>
        HttpResponse.json(isCompleted ? [shadowSwingMenu] : []),
      ),
      http.post(baseUrl("/api/v2/shadow_swing_sessions/7/complete"), () => {
        isCompleted = true;
        return HttpResponse.json({ id: 7, swing_count: 100 });
      }),
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
    await waitFor(() => expect(result.current.menus.isLoading).toBe(false));
    expect(result.current.menus.menus).toEqual([]);

    await act(async () => {
      await result.current.mutations.completeSession({
        id: 7,
        swingCount: 100,
      });
    });

    await waitFor(() =>
      expect(result.current.menus.menus.map((menu) => menu.name)).toContain(
        "素振り",
      ),
    );
  });
});
