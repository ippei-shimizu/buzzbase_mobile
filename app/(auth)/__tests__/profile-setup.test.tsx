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

const profileResponse = {
  id: 7,
  user_id: "buzz",
  name: "テスト",
  team_id: null,
  positions: [],
  throw_hand: null,
  batting_side: null,
};

const givenProfile = () => {
  server.use(
    http.get(apiUrl("/user"), () => HttpResponse.json(profileResponse)),
  );
};

describe("profile-setup 画面", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenProfile();
  });

  it("スキップでダッシュボードへ遷移し、保存リクエストを送らない", async () => {
    let profileUpdated = false;
    server.use(
      http.put(apiUrl("/user"), () => {
        profileUpdated = true;
        return HttpResponse.json({});
      }),
    );

    const screen = renderWithProviders(<ProfileSetupScreen />);
    fireEvent.press(await screen.findByText("スキップ"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(profileUpdated).toBe(false);
  });

  it("チーム名を入力して保存すると、作成したチームの id をプロフィールへ送る", async () => {
    let createdTeamName: string | null = null;
    let sentTeamId: string | null = null;
    server.use(
      http.post(apiUrl("/teams"), async ({ request }) => {
        const body = (await request.json()) as { team: { name: string } };
        createdTeamName = body.team.name;
        return HttpResponse.json({ id: 42, name: body.team.name });
      }),
      http.put(apiUrl("/user"), async ({ request }) => {
        sentTeamId = readFormField(await request.formData(), "user[team_id]");
        return HttpResponse.json({});
      }),
      http.post(apiUrl("/user_positions"), () => HttpResponse.json({})),
    );

    const screen = renderWithProviders(<ProfileSetupScreen />);
    fireEvent.changeText(
      await screen.findByPlaceholderText("チーム名を入力"),
      "BUZZ学園",
    );
    fireEvent.press(screen.getByText("はじめる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(createdTeamName).toBe("BUZZ学園");
    expect(sentTeamId).toBe("42");
  });

  it("何も入力せず保存してもチームは作成せず空の team_id を送る", async () => {
    let teamCreated = false;
    let sentTeamId: string | null = null;
    server.use(
      http.post(apiUrl("/teams"), () => {
        teamCreated = true;
        return HttpResponse.json({ id: 1, name: "x" });
      }),
      http.put(apiUrl("/user"), async ({ request }) => {
        sentTeamId = readFormField(await request.formData(), "user[team_id]");
        return HttpResponse.json({});
      }),
      http.post(apiUrl("/user_positions"), () => HttpResponse.json({})),
    );

    const screen = renderWithProviders(<ProfileSetupScreen />);
    fireEvent.press(await screen.findByText("はじめる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(teamCreated).toBe(false);
    expect(sentTeamId).toBe("");
  });

  it("保存に失敗したときは遷移せずエラーを表示する", async () => {
    server.use(
      http.put(apiUrl("/user"), () =>
        HttpResponse.json({ errors: ["failed"] }, { status: 422 }),
      ),
    );

    const screen = renderWithProviders(<ProfileSetupScreen />);
    fireEvent.press(await screen.findByText("はじめる"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "保存に失敗しました。あとからプロフィール編集で設定できます",
        ),
      ).toBeTruthy();
    });
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });
});
