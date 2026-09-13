/**
 * グループ作成画面の無料上限（GROUP_FREE_LIMIT）到達時の振る舞いテスト。
 * 上限に当たった瞬間が課金ファネルの起点になるため、Paywall 表示と計測を両方検証する。
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
import GroupCreateScreen from "../create";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ renderScreenOptions: true });
});

/* eslint-enable @typescript-eslint/no-require-imports */

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  isPostHogEnabled: true,
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
}

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

beforeEach(() => {
  jest.clearAllMocks();
});

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
    http.get(apiUrl("/user"), () => HttpResponse.json({ id: 1, name: "本人" })),
    http.get(apiUrl("/users/1/following_users"), () => HttpResponse.json([])),
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

const fillNameAndSave = async () => {
  fireEvent.changeText(
    screen.getByPlaceholderText("グループ名"),
    "新チームの3年",
  );
  fireEvent.press(screen.getByText("作成"));
};

describe("GroupCreateScreen", () => {
  it("無料ユーザーが既に1グループ所属していると、作成を押すとPaywallが開きAPIは呼ばれない", async () => {
    respondFree();
    setupCommonHandlers(1);
    let createCalled = false;
    server.use(
      http.post(apiUrl("/groups"), () => {
        createCalled = true;
        return HttpResponse.json({ id: 2 });
      }),
    );

    renderWithProviders(<GroupCreateScreen />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("グループ名")).toBeOnTheScreen(),
    );
    await fillNameAndSave();

    await waitFor(() =>
      expect(screen.getByText("BUZZ BASE")).toBeOnTheScreen(),
    );
    expect(createCalled).toBe(false);
    expect(
      mockCapture.mock.calls.filter(
        ([event]) => event === "free limit reached",
      ),
    ).toEqual([
      [
        "free limit reached",
        {
          feature: "unlimited_groups",
          source: "group_create",
          detection: "client",
        },
      ],
    ]);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("サーバー側の上限エラー（403）でもPaywallとサーバーの文言を出し、上限到達を計測する", async () => {
    respondFree();
    setupCommonHandlers(0);
    server.use(
      http.post(apiUrl("/groups"), () =>
        HttpResponse.json(
          {
            error: "group_limit_exceeded",
            message: "Pro プランでグループを無制限に作成・参加できます",
          },
          { status: 403 },
        ),
      ),
    );

    renderWithProviders(<GroupCreateScreen />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("グループ名")).toBeOnTheScreen(),
    );
    await fillNameAndSave();

    await waitFor(() =>
      expect(
        screen.getByText("Pro プランでグループを無制限に作成・参加できます"),
      ).toBeOnTheScreen(),
    );
    expect(
      mockCapture.mock.calls.filter(
        ([event]) => event === "free limit reached",
      ),
    ).toEqual([
      [
        "free limit reached",
        {
          feature: "unlimited_groups",
          source: "group_create",
          detection: "server",
        },
      ],
    ]);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("Proユーザーは複数グループ所属していても作成でき、上限到達は計測しない", async () => {
    respondPro();
    setupCommonHandlers(3);
    server.use(
      http.post(apiUrl("/groups"), () => HttpResponse.json({ id: 9 })),
    );

    renderWithProviders(<GroupCreateScreen />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText("グループ名")).toBeOnTheScreen(),
    );
    await fillNameAndSave();

    await waitFor(() =>
      expect(getRouterSpies().replace).toHaveBeenCalledWith(
        "/(groups)/share-invite?id=9",
      ),
    );
    expect(mockCapture).not.toHaveBeenCalledWith(
      "free limit reached",
      expect.anything(),
    );
  });
});
