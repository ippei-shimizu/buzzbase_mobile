/**
 * プロフィール保存後にマイページのチーム表示が新しいチームへ差し替わることの振る舞いテスト。
 */
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import {
  TestProviders,
  createTestQueryClient,
} from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import { useMyTeam } from "../useMyTeam";
import { useProfileEdit } from "../useProfileEdit";

const USER_ID = "buzz-taro";

/** MSW が intercept するまでのマイクロタスク/タイマーを消化する。 */
const flushPendingRequests = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

const respondMyTeam = (team: {
  name: string;
  category_name: string;
  prefecture_name: string;
}) => {
  server.use(
    http.get(apiUrl(`/teams/${USER_ID}/my_team`), () =>
      HttpResponse.json({ id: 1, ...team }),
    ),
  );
};

const buildWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
};

describe("プロフィール保存後の所属チーム表示", () => {
  it("保存に成功すると myTeam が再取得され、新しいチーム情報が返る", async () => {
    respondMyTeam({
      name: "旧チーム",
      category_name: "高校生",
      prefecture_name: "東京都",
    });
    server.use(
      http.put(apiUrl("/user"), () => new HttpResponse(null, { status: 200 })),
    );

    const { result } = renderHook(
      () => ({ myTeam: useMyTeam(USER_ID), profileEdit: useProfileEdit() }),
      { wrapper: buildWrapper() },
    );

    await waitFor(() =>
      expect(result.current.myTeam.teamName).toBe("旧チーム"),
    );

    respondMyTeam({
      name: "新チーム",
      category_name: "大学生",
      prefecture_name: "神奈川県",
    });
    await result.current.profileEdit.updateProfile(new FormData());

    await waitFor(() => {
      expect(result.current.myTeam.teamName).toBe("新チーム");
      expect(result.current.myTeam.categoryName).toBe("大学生");
      expect(result.current.myTeam.prefectureName).toBe("神奈川県");
    });
  });

  it("userId が未確定のときは refetch を呼んでもリクエストしない", async () => {
    const requestedUserIds: string[] = [];
    server.use(
      http.get(apiUrl("/teams/:userId/my_team"), ({ params }) => {
        requestedUserIds.push(String(params.userId));
        return HttpResponse.json({
          id: 1,
          name: "チーム",
          category_name: "高校生",
          prefecture_name: "東京都",
        });
      }),
    );

    const { result } = renderHook(() => useMyTeam(undefined), {
      wrapper: buildWrapper(),
    });

    result.current.refetch();
    await flushPendingRequests();

    expect(requestedUserIds).toEqual([]);
  });
});
