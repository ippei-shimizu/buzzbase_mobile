import type { RouterSpies } from "../../../../__tests__/test-utils/mockExpoRouter";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import ProfileEditScreen from "../edit";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
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
  introduction: "",
  is_private: false,
  image: null,
  team_id: null as number | null,
  positions: [],
  throw_hand: null,
  batting_side: null,
};

// 復元はプロフィール → 所属チーム → マスタの順に揃ってから走るため、既定の 1 秒では初回実行で間に合わないことがある。
const RESTORE_WAIT_OPTIONS = { timeout: 3000 };

interface SaveRecorder {
  teamId: string | null;
  createdTeamNames: string[];
  updatedTeamIds: string[];
  unscopedTeamsRequested: boolean;
}

const setUpServer = (
  profile: typeof PROFILE,
  searchTeamsResponder: (query: string, limit: string) => unknown[] = () => [],
): SaveRecorder => {
  const recorder: SaveRecorder = {
    teamId: null,
    createdTeamNames: [],
    updatedTeamIds: [],
    unscopedTeamsRequested: false,
  };

  server.use(
    http.get(apiUrl("/user"), () => HttpResponse.json(profile)),
    http.get(apiUrl("/prefectures"), () =>
      HttpResponse.json([{ id: 13, name: "東京都" }]),
    ),
    http.get(apiUrl("/baseball_categories"), () =>
      HttpResponse.json([{ id: 3, name: "高校" }]),
    ),
    http.get(apiUrl("/users/7/awards"), () => HttpResponse.json([])),
    http.get(apiUrl("/teams/buzz/my_team"), () =>
      HttpResponse.json({
        name: "既存チーム",
        category_name: "高校",
        prefecture_name: "東京都",
      }),
    ),
    http.get(apiUrl("/teams"), ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const query = searchParams.get("q");
      const limit = searchParams.get("limit");
      if (query === null && limit === null) {
        recorder.unscopedTeamsRequested = true;
        return HttpResponse.json([]);
      }
      return HttpResponse.json(searchTeamsResponder(query ?? "", limit ?? ""));
    }),
    http.post(apiUrl("/teams"), async ({ request }) => {
      const body = (await request.json()) as { team: { name: string } };
      recorder.createdTeamNames.push(body.team.name);
      return HttpResponse.json({ id: 42, name: body.team.name });
    }),
    http.put(apiUrl("/teams/:id"), ({ params }) => {
      recorder.updatedTeamIds.push(String(params.id));
      return HttpResponse.json({});
    }),
    http.put(apiUrl("/user"), async ({ request }) => {
      recorder.teamId = readFormField(
        await request.formData(),
        "user[team_id]",
      );
      return HttpResponse.json({});
    }),
    http.post(apiUrl("/user_positions"), () => HttpResponse.json({})),
  );

  return recorder;
};

const render = () => renderWithProviders(<ProfileEditScreen />);

const saveAndWaitForBack = async (screen: ReturnType<typeof render>) => {
  fireEvent.press(screen.getByText("保存"));
  await waitFor(() => {
    expect(getRouterSpies().back).toHaveBeenCalled();
  });
};

describe("プロフィール編集画面の所属チーム", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("所属チームの名前・カテゴリ・地域を復元し、そのまま保存すると同じ team_id を送る", async () => {
    const recorder = setUpServer({ ...PROFILE, team_id: 99 });
    const screen = render();

    expect(
      await screen.findByText("既存チーム", {}, RESTORE_WAIT_OPTIONS),
    ).toBeTruthy();
    expect(screen.getByText("高校")).toBeTruthy();
    expect(screen.getByText("東京都")).toBeTruthy();

    await saveAndWaitForBack(screen);
    expect(recorder.teamId).toBe("99");
    expect(recorder.updatedTeamIds).toEqual(["99"]);
    expect(recorder.createdTeamNames).toEqual([]);
  });

  it("チームの全件取得はしない", async () => {
    const recorder = setUpServer(PROFILE);
    const screen = render();

    fireEvent.press(await screen.findByText("チーム名を検索・入力"));
    fireEvent.changeText(screen.getByPlaceholderText("チーム名を入力"), "既存");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(recorder.unscopedTeamsRequested).toBe(false);
  });

  it("入力に応じて候補を検索し、選んだチームの id を送る", async () => {
    const recorder = setUpServer(PROFILE, (query) =>
      query === "BUZZ"
        ? [{ id: 55, name: "BUZZ学園", category_id: 3, prefecture_id: 13 }]
        : [],
    );
    const screen = render();

    fireEvent.press(await screen.findByText("チーム名を検索・入力"));
    fireEvent.changeText(screen.getByPlaceholderText("チーム名を入力"), "BUZZ");
    fireEvent.press(await screen.findByText("BUZZ学園"));

    expect(screen.getByText("高校")).toBeTruthy();
    await saveAndWaitForBack(screen);
    expect(recorder.teamId).toBe("55");
    expect(recorder.createdTeamNames).toEqual([]);
  });

  it("候補から選ばずに確定した名前が既存チームと完全一致すれば、新規作成せずその id を送る", async () => {
    // サジェスト件数では完全一致が溢れ、上限件数で引いたときだけ見つかる状況
    const recorder = setUpServer(PROFILE, (query, limit) =>
      query === "BUZZ学園" && limit === "100"
        ? [{ id: 55, name: "BUZZ学園", category_id: 3, prefecture_id: 13 }]
        : [],
    );
    const screen = render();

    fireEvent.press(await screen.findByText("チーム名を検索・入力"));
    fireEvent.changeText(
      screen.getByPlaceholderText("チーム名を入力"),
      "BUZZ学園",
    );
    fireEvent.press(screen.getByText("「BUZZ学園」で決定"));
    fireEvent.press(screen.getByText("カテゴリを選択"));
    fireEvent.press(await screen.findByText("高校"));
    fireEvent.press(screen.getByText("都道府県を選択"));
    fireEvent.press(await screen.findByText("東京都"));

    await saveAndWaitForBack(screen);
    expect(recorder.teamId).toBe("55");
    expect(recorder.createdTeamNames).toEqual([]);
    expect(recorder.updatedTeamIds).toEqual([]);
  });

  it("候補から選ばずに確定した名前の既存チームがカテゴリ・地域違いなら、そのチームを更新せず新規作成する", async () => {
    const recorder = setUpServer(PROFILE, (query) =>
      query === "BUZZ学園"
        ? [{ id: 55, name: "BUZZ学園", category_id: 1, prefecture_id: 27 }]
        : [],
    );
    const screen = render();

    fireEvent.press(await screen.findByText("チーム名を検索・入力"));
    fireEvent.changeText(
      screen.getByPlaceholderText("チーム名を入力"),
      "BUZZ学園",
    );
    fireEvent.press(screen.getByText("「BUZZ学園」で決定"));
    fireEvent.press(screen.getByText("カテゴリを選択"));
    fireEvent.press(await screen.findByText("高校"));
    fireEvent.press(screen.getByText("都道府県を選択"));
    fireEvent.press(await screen.findByText("東京都"));

    await saveAndWaitForBack(screen);
    expect(recorder.updatedTeamIds).toEqual([]);
    expect(recorder.createdTeamNames).toEqual(["BUZZ学園"]);
    expect(recorder.teamId).toBe("42");
  });

  it("復元したチーム名のまま確定し直しても、同名の別チームに差し替えず元の id を送る", async () => {
    const recorder = setUpServer({ ...PROFILE, team_id: 99 }, () => [
      { id: 1, name: "既存チーム", category_id: 3, prefecture_id: 13 },
    ]);
    const screen = render();

    fireEvent.press(
      await screen.findByText("既存チーム", {}, RESTORE_WAIT_OPTIONS),
    );
    fireEvent.press(screen.getByText("「既存チーム」で決定"));

    await saveAndWaitForBack(screen);
    expect(recorder.teamId).toBe("99");
  });
});
