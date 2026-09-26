/**
 * profile-setup 画面の振る舞いテスト。
 *
 * 方針:
 * - サービス関数を jest.mock せず、HTTP 層を MSW で intercept する。
 * - 環境境界（expo-router）のみ jest.mock する。
 * - 公開 UI（placeholder / Button label）から操作し、送信内容と遷移を assert する。
 */
import type { RouterSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import ProfileSetupScreen from "../profile-setup";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouterMock = require("expo-router") as {
    __routerSpies: RouterSpies;
  };
  return expoRouterMock.__routerSpies;
};

// React Native の FormData 型には get が無いため、MSW が渡す DOM FormData として読む
const readFormField = (formData: unknown, key: string): string | null =>
  (formData as { get(name: string): string | null }).get(key);

const PROFILE = {
  id: 7,
  user_id: "buzz",
  name: "テスト",
  team_id: null,
  positions: [],
  throw_hand: null,
  batting_side: null,
};

interface SavedRequest {
  teamId: string | null;
  throwHand: string | null;
  positionsUserId: number | null;
  positionIds: number[] | null;
  createdTeamName: string | null;
  teamSearchCount: number;
}

const captureSave = (): SavedRequest => {
  const saved: SavedRequest = {
    teamId: null,
    throwHand: null,
    positionsUserId: null,
    positionIds: null,
    createdTeamName: null,
    teamSearchCount: 0,
  };

  server.use(
    http.get(apiUrl("/user"), () => HttpResponse.json(PROFILE)),
    http.get(apiUrl("/teams"), () => {
      saved.teamSearchCount += 1;
      return HttpResponse.json([]);
    }),
    http.post(apiUrl("/teams"), async ({ request }) => {
      const body = (await request.json()) as { team: { name: string } };
      saved.createdTeamName = body.team.name;
      return HttpResponse.json({ id: 42, name: body.team.name });
    }),
    http.put(apiUrl("/user"), async ({ request }) => {
      const formData = await request.formData();
      saved.teamId = readFormField(formData, "user[team_id]");
      saved.throwHand = readFormField(formData, "user[throw_hand]");
      return HttpResponse.json({});
    }),
    http.post(apiUrl("/user_positions"), async ({ request }) => {
      const body = (await request.json()) as {
        user_id: number;
        position_ids: number[];
      };
      saved.positionsUserId = body.user_id;
      saved.positionIds = body.position_ids;
      return HttpResponse.json({});
    }),
  );

  return saved;
};

/** プロフィール取得が終わるまで「はじめる」は disabled なので、押せるようになるまで待つ。 */
const renderAndWaitReady = async () => {
  const screen = renderWithProviders(<ProfileSetupScreen />);
  await waitFor(() => {
    expect(screen.getByText("はじめる")).not.toBeDisabled();
  });
  return screen;
};

describe("profile-setup 画面", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("スキップでダッシュボードへ遷移し、保存リクエストを送らない", async () => {
    const saved = captureSave();

    const screen = await renderAndWaitReady();
    fireEvent.press(screen.getByText("スキップ"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(saved.teamId).toBeNull();
    expect(saved.positionIds).toBeNull();
  });

  it("チーム名を入力して保存すると、完全一致を探してから作成した id を送る", async () => {
    const saved = captureSave();

    const screen = await renderAndWaitReady();
    fireEvent.changeText(
      screen.getByPlaceholderText("チーム名を入力"),
      "BUZZ学園",
    );
    fireEvent.press(screen.getByText("はじめる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(saved.createdTeamName).toBe("BUZZ学園");
    expect(saved.teamId).toBe("42");
    // 送信時の引き当て検索が走っている（候補表示の検索と合わせて1回以上）
    expect(saved.teamSearchCount).toBeGreaterThan(0);
  });

  it("何も入力せず保存してもチームは作成せず、空の team_id とポジション0件を送る", async () => {
    const saved = captureSave();

    const screen = await renderAndWaitReady();
    fireEvent.press(screen.getByText("はじめる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(saved.createdTeamName).toBeNull();
    expect(saved.teamId).toBe("");
    expect(saved.positionsUserId).toBe(PROFILE.id);
    expect(saved.positionIds).toEqual([]);
  });

  it("保存に失敗したときは遷移せずエラーを表示する", async () => {
    server.use(
      http.get(apiUrl("/user"), () => HttpResponse.json(PROFILE)),
      http.put(apiUrl("/user"), () =>
        HttpResponse.json({ errors: ["failed"] }, { status: 422 }),
      ),
    );

    const screen = await renderAndWaitReady();
    fireEvent.press(screen.getByText("はじめる"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "保存に失敗しました。あとからプロフィール編集で設定できます",
        ),
      ).toBeTruthy();
    });
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("既に設定済みのユーザーが未入力で保存しても既存値を消さない", async () => {
    const saved: { teamId: string | null; positionIds: number[] | null } = {
      teamId: null,
      positionIds: null,
    };
    server.use(
      http.get(apiUrl("/user"), () =>
        HttpResponse.json({
          ...PROFILE,
          team_id: 99,
          positions: [{ id: 3, name: "ピッチャー" }],
          throw_hand: "left",
        }),
      ),
      http.get(apiUrl("/teams/99/team_name"), () =>
        HttpResponse.json({ name: "既存チーム" }),
      ),
      http.get(apiUrl("/teams"), () => HttpResponse.json([])),
      http.put(apiUrl("/user"), async ({ request }) => {
        saved.teamId = readFormField(await request.formData(), "user[team_id]");
        return HttpResponse.json({});
      }),
      http.post(apiUrl("/user_positions"), async ({ request }) => {
        const body = (await request.json()) as { position_ids: number[] };
        saved.positionIds = body.position_ids;
        return HttpResponse.json({});
      }),
    );

    const screen = await renderAndWaitReady();
    // チーム名は id とは別クエリで解決されるため、入力欄へ復元されるまで待つ
    await waitFor(() => {
      expect(screen.getByPlaceholderText("チーム名を入力").props.value).toBe(
        "既存チーム",
      );
    });
    fireEvent.press(screen.getByText("はじめる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(saved.teamId).toBe("99");
    expect(saved.positionIds).toEqual([3]);
  });
});
