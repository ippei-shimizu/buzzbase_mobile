/**
 * グループ詳細画面の振る舞いテスト（ランキング行タップでプロフィールへ遷移）。
 *
 * 方針:
 * - 公開 UI から操作し、画面遷移（router.push）の発火を検証する。
 * - HTTP は MSW で intercept（services を jest.mock しない）。
 */
import type { GroupDetail } from "../../../../types/group";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "1" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { push: jest.Mock } };
  return m.__routerSpies;
};

const groupDetail: GroupDetail = {
  group: {
    id: 1,
    name: "テストグループ",
    icon: { url: null },
    group_users: [
      { user_id: 1, group_id: 1 },
      { user_id: 2, group_id: 1 },
    ],
  },
  accepted_users: [
    { id: 1, name: "田中太郎", user_id: "tanaka", image: { url: null } },
    { id: 2, name: "鈴木次郎", user_id: "suzuki", image: { url: null } },
  ],
  batting_averages: [],
  batting_stats: [
    { user_id: 1, batting_average: 0.35 },
    { user_id: 2, batting_average: 0.3 },
  ],
  pitching_aggregate: [],
  pitching_stats: [{ user_id: 2, era: 2.5 }],
  available_years: [2025],
};

const renderGroupDetail = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GroupDetailScreen = require("../[id]").default;
  return renderWithProviders(<GroupDetailScreen />);
};

beforeEach(() => {
  jest.clearAllMocks();
  server.use(
    http.get(apiUrl("/groups/1"), () => HttpResponse.json(groupDetail)),
  );
});

describe("グループ詳細 個人成績ランキング", () => {
  it("打撃ランキングの行をタップするとそのユーザーのプロフィールへ遷移する", async () => {
    const { getByText } = renderGroupDetail();

    await waitFor(() => {
      expect(getByText("田中太郎")).toBeTruthy();
    });

    fireEvent.press(getByText("田中太郎"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/tanaka");
  });

  it("投手ランキングの行をタップしてもプロフィールへ遷移する", async () => {
    const { getByText } = renderGroupDetail();

    await waitFor(() => {
      expect(getByText("田中太郎")).toBeTruthy();
    });

    fireEvent.press(getByText("投手成績"));

    await waitFor(() => {
      expect(getByText("鈴木次郎")).toBeTruthy();
    });

    fireEvent.press(getByText("鈴木次郎"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/(profile)/suzuki");
  });
});
