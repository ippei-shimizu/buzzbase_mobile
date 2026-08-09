/**
 * 招待コード参加画面の無料上限（GROUP_FREE_LIMIT）の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS, FREE_FEATURES } from "../../../../types/pro";
import JoinGroupScreen from "../join";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  dismissAll: jest.Mock;
}

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

// router のスパイはモジュールスコープで使い回されるため、
// テスト間で呼び出し履歴が混ざらないよう毎回クリアする。
beforeEach(() => {
  jest.clearAllMocks();
});

const inviteLinkInfo = {
  group: { id: 1, name: "招待先グループ", icon: null, member_count: 3 },
  inviter: { name: "招待者", image: { url: null } },
};

const respondFree = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
  );
};

const respondPro = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "active",
          pro_active: true,
          expires_at: "2026-12-31T00:00:00+09:00",
          days_remaining: 30,
        },
        entitlements: [...FREE_FEATURES, "unlimited_groups"],
      }),
    ),
  );
};

const setupCommonHandlers = (groupCount: number) => {
  server.use(
    http.get(apiUrl("/invite_links/ABC12345"), () =>
      HttpResponse.json(inviteLinkInfo),
    ),
    http.get(apiUrl("/groups"), () =>
      HttpResponse.json(
        Array.from({ length: groupCount }, (_, i) => ({
          id: i + 1,
          name: `グループ${i + 1}`,
          icon: null,
          group_users: [],
        })),
      ),
    ),
  );
};

const lookupAndPressJoin = async () => {
  const codeInput = screen.getByPlaceholderText("例: ABC12DEF");
  fireEvent.changeText(codeInput, "ABC12345");
  fireEvent.press(screen.getByText("確認する"));

  await waitFor(() =>
    expect(screen.getByText("招待先グループ")).toBeOnTheScreen(),
  );
  fireEvent.press(screen.getByText("グループに参加"));
};

describe("JoinGroupScreen", () => {
  it("無料ユーザーが既に1グループ所属していると、参加を押すとPaywallが開きAPIは呼ばれない", async () => {
    respondFree();
    setupCommonHandlers(1);
    let acceptCalled = false;
    server.use(
      http.post(apiUrl("/invite_links/ABC12345/accept"), () => {
        acceptCalled = true;
        return HttpResponse.json({ success: true, group_id: 1 });
      }),
    );

    renderWithProviders(<JoinGroupScreen />);
    await lookupAndPressJoin();

    await waitFor(() =>
      expect(screen.getByText("BUZZ BASE")).toBeOnTheScreen(),
    );
    expect(acceptCalled).toBe(false);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("無料ユーザーが0グループなら通常通り参加できる", async () => {
    respondFree();
    setupCommonHandlers(0);
    server.use(
      http.post(apiUrl("/invite_links/ABC12345/accept"), () =>
        HttpResponse.json({ success: true, group_id: 1 }),
      ),
    );

    renderWithProviders(<JoinGroupScreen />);
    await lookupAndPressJoin();

    await waitFor(() =>
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(groups)/1"),
    );
  });

  it("Proユーザーは複数グループ所属していても制限なく参加できる", async () => {
    respondPro();
    setupCommonHandlers(3);
    server.use(
      http.post(apiUrl("/invite_links/ABC12345/accept"), () =>
        HttpResponse.json({ success: true, group_id: 1 }),
      ),
    );

    renderWithProviders(<JoinGroupScreen />);
    await lookupAndPressJoin();

    await waitFor(() =>
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(groups)/1"),
    );
  });

  it("サーバー側の上限エラー（403）では汎用エラーではなくPaywallとサーバーの文言を表示する", async () => {
    respondFree();
    setupCommonHandlers(0);
    server.use(
      http.post(apiUrl("/invite_links/ABC12345/accept"), () =>
        HttpResponse.json(
          { error: "Pro プランでグループを無制限に作成・参加できます" },
          { status: 403 },
        ),
      ),
    );

    renderWithProviders(<JoinGroupScreen />);
    await lookupAndPressJoin();

    await waitFor(() =>
      expect(
        screen.getByText("Pro プランでグループを無制限に作成・参加できます"),
      ).toBeOnTheScreen(),
    );
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("招待コードの確認（プレビュー表示）は所属グループ数に関わらず常に実行できる", async () => {
    respondFree();
    setupCommonHandlers(1);

    renderWithProviders(<JoinGroupScreen />);
    const codeInput = screen.getByPlaceholderText("例: ABC12DEF");
    fireEvent.changeText(codeInput, "ABC12345");
    fireEvent.press(screen.getByText("確認する"));

    await waitFor(() =>
      expect(screen.getByText("招待先グループ")).toBeOnTheScreen(),
    );
    expect(screen.getByText("グループに参加")).toBeOnTheScreen();
  });
});
