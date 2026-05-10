/**
 * useGameRecord フックの結合テスト。
 *
 * 方針:
 * - HTTP 層を MSW で intercept し、サービス関数の jest.mock を使わない。
 * - 試合記録ウィザード（Step1〜Step3）の submit がどのエンドポイントに
 *   どんな payload を送るかを公開 API（mutation.mutateAsync の結果）から検証する。
 * - 内部 state や useEffect の発火は assert しない。
 */
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react-native";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";
import { useGameRecord } from "../useGameRecord";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  useGameRecordStore.getState().reset();
});

describe("useGameRecord submitStep1", () => {
  it("matchResult を作成し、gameResult に match_result_id を紐付ける", async () => {
    // ストアに最低限の入力をセット
    useGameRecordStore.getState().setField("gameResultId", 100);
    useGameRecordStore.getState().setField("myTeamId", 10);
    useGameRecordStore.getState().setField("myTeamName", "イーグルス");
    useGameRecordStore.getState().setField("opponentTeamId", 20);
    useGameRecordStore.getState().setField("opponentTeamName", "ライオンズ");
    useGameRecordStore.getState().setField("date", "2026-05-09");
    useGameRecordStore.getState().setField("matchType", "公式戦");
    useGameRecordStore.getState().setField("battingOrder", "3");
    useGameRecordStore.getState().setField("defensivePosition", "投手");

    let matchResultBody: Record<string, unknown> | null = null;
    let gameResultUpdateBody: Record<string, unknown> | null = null;

    server.use(
      http.post(apiUrl("/match_results"), async ({ request }) => {
        matchResultBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 555 });
      }),
      http.put(apiUrl("/game_results/100"), async ({ request }) => {
        gameResultUpdateBody = (await request.json()) as Record<
          string,
          unknown
        >;
        return HttpResponse.json({ ok: true });
      }),
    );

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitStep1.mutateAsync();
    });

    expect(matchResultBody).toMatchObject({
      match_result: {
        game_result_id: 100,
        date_and_time: "2026-05-09T00:00:00",
        match_type: "公式戦",
        my_team_id: 10,
        opponent_team_id: 20,
        batting_order: "3",
        defensive_position: "投手",
      },
    });
    expect(gameResultUpdateBody).toEqual({
      game_result: { match_result_id: 555, season_id: null },
    });
    // 振る舞いとして、新規作成後 matchResultId がストアに反映される
    expect(useGameRecordStore.getState().matchResultId).toBe(555);
  });
});

describe("useGameRecord submitStep2", () => {
  it("打席を順番に POST し、batting_average を作成して gameResult に紐付ける", async () => {
    useGameRecordStore.getState().setField("gameResultId", 100);
    useGameRecordStore.getState().setField("userId", 7);
    // 打席 1 件: 中ヒット (position=10, result=7)
    useGameRecordStore
      .getState()
      .setBattingBoxes([{ id: 1, position: 10, result: 7, text: "中安" }]);
    useGameRecordStore.getState().setField("runsBattedIn", 2);

    const plateBodies: Record<string, unknown>[] = [];
    let battingAverageBody: Record<string, unknown> | null = null;
    let updateBattingAverageIdBody: Record<string, unknown> | null = null;

    server.use(
      // 既存打席のチェック: 無し
      http.get(apiUrl("/plate_search"), () => HttpResponse.json(null)),
      http.post(apiUrl("/plate_appearances"), async ({ request }) => {
        plateBodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: 1001 });
      }),
      http.post(apiUrl("/batting_averages"), async ({ request }) => {
        battingAverageBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 999 });
      }),
      http.put(
        apiUrl("/game_results/100/update_batting_average_id"),
        async ({ request }) => {
          updateBattingAverageIdBody = (await request.json()) as Record<
            string,
            unknown
          >;
          return HttpResponse.json({ ok: true });
        },
      ),
    );

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitStep2.mutateAsync();
    });

    expect(plateBodies).toHaveLength(1);
    expect(plateBodies[0]).toMatchObject({
      plate_appearance: {
        game_result_id: 100,
        user_id: 7,
        batter_box_number: 1,
        // hitDirectionToLegacy[10] = 8（中→中）
        batting_position_id: 8,
        plate_result_id: 7,
      },
    });

    expect(battingAverageBody).toMatchObject({
      batting_average: {
        game_result_id: 100,
        user_id: 7,
        hit: 1,
        runs_batted_in: 2,
        times_at_bat: 1,
        at_bats: 1,
        total_bases: 1,
      },
    });
    expect(updateBattingAverageIdBody).toEqual({
      game_result: { batting_average_id: 999 },
    });
    expect(useGameRecordStore.getState().battingAverageId).toBe(999);
  });

  it("打撃成績が完全に空ならサーバ通信を行わずスキップする", async () => {
    useGameRecordStore.getState().setField("gameResultId", 100);
    useGameRecordStore.getState().setField("userId", 7);

    let posted = false;
    server.use(
      http.post(apiUrl("/plate_appearances"), () => {
        posted = true;
        return HttpResponse.json({ id: 1 });
      }),
      http.post(apiUrl("/batting_averages"), () => {
        posted = true;
        return HttpResponse.json({ id: 1 });
      }),
    );

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitStep2.mutateAsync();
    });

    expect(posted).toBe(false);
  });
});

describe("useGameRecord submitStep3", () => {
  it("pitching_result を作成し、gameResult に紐付ける", async () => {
    useGameRecordStore.getState().setField("gameResultId", 100);
    useGameRecordStore.getState().setField("userId", 7);
    useGameRecordStore.getState().setField("inningsPitchedWhole", 7);
    useGameRecordStore.getState().setField("inningsPitchedFraction", 0);
    useGameRecordStore.getState().setField("strikeouts", 8);
    useGameRecordStore.getState().setField("earnedRun", 2);

    let pitchingBody: Record<string, unknown> | null = null;
    let updatePitchingIdBody: Record<string, unknown> | null = null;

    server.use(
      http.post(apiUrl("/pitching_results"), async ({ request }) => {
        pitchingBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 777 });
      }),
      http.put(
        apiUrl("/game_results/100/update_pitching_result_id"),
        async ({ request }) => {
          updatePitchingIdBody = (await request.json()) as Record<
            string,
            unknown
          >;
          return HttpResponse.json({ ok: true });
        },
      ),
    );

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitStep3.mutateAsync();
    });

    expect(pitchingBody).toMatchObject({
      pitching_result: {
        game_result_id: 100,
        user_id: 7,
        innings_pitched: 7,
        strikeouts: 8,
        earned_run: 2,
      },
    });
    expect(updatePitchingIdBody).toEqual({
      game_result: { pitching_result_id: 777 },
    });
    expect(useGameRecordStore.getState().pitchingResultId).toBe(777);
  });

  it("投手成績が完全に空なら API を呼ばず無視する", async () => {
    useGameRecordStore.getState().setField("gameResultId", 100);
    useGameRecordStore.getState().setField("userId", 7);

    let posted = false;
    server.use(
      http.post(apiUrl("/pitching_results"), () => {
        posted = true;
        return HttpResponse.json({ id: 1 });
      }),
    );

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitStep3.mutateAsync();
    });

    expect(posted).toBe(false);
  });
});

describe("useGameRecord resetFlow", () => {
  it("ストアを reset し、isEditMode が false に戻る", async () => {
    useGameRecordStore.getState().setField("isEditMode", true);
    useGameRecordStore.getState().setField("myTeamName", "old");

    const { result } = renderHook(() => useGameRecord(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.resetFlow();
    });

    expect(useGameRecordStore.getState().isEditMode).toBe(false);
    expect(useGameRecordStore.getState().myTeamName).toBe("");
  });
});
