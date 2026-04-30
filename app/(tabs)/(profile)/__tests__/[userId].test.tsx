import { fireEvent, render, screen, act } from "@testing-library/react-native";
import React from "react";
import UserProfileScreen from "../[userId]";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ userId: "42" }),
  useRouter: () => ({ push: mockPush }),
}));

const mockUseUserProfileDetail = jest.fn();
const mockUseFollowUser = jest.fn();
const mockUseUnfollowUser = jest.fn();
jest.mock("@hooks/useRelationship", () => ({
  useUserProfileDetail: (userId: string) => mockUseUserProfileDetail(userId),
  useFollowUser: () => mockUseFollowUser(),
  useUnfollowUser: () => mockUseUnfollowUser(),
}));

const mockUseUserStats = jest.fn();
jest.mock("@hooks/useProfileStats", () => ({
  useUserStats: (userId: number | undefined, filters: unknown) =>
    mockUseUserStats(userId, filters),
}));

const mockUseFilteredUserGameResults = jest.fn();
jest.mock("@hooks/useGameResults", () => ({
  useFilteredUserGameResults: (userId: number | undefined, params: unknown) =>
    mockUseFilteredUserGameResults(userId, params),
}));

const mockUseSeasons = jest.fn();
jest.mock("@hooks/useSeasons", () => ({
  useSeasons: (userId: number | undefined) => mockUseSeasons(userId),
}));

const mockUseTournaments = jest.fn();
jest.mock("@hooks/useTournaments", () => ({
  useTournaments: (userId: number | undefined) => mockUseTournaments(userId),
}));

const mockUseAvailableYears = jest.fn();
jest.mock("@hooks/useAvailableYears", () => ({
  useAvailableYears: (userId: number | undefined) =>
    mockUseAvailableYears(userId),
}));

jest.mock("@hooks/useMasterData", () => ({
  useTeams: () => ({ data: [] }),
  usePrefectures: () => ({ data: [] }),
  useBaseballCategories: () => ({ data: [] }),
}));

jest.mock("@hooks/useAwards", () => ({
  useUserAwards: () => ({ data: [] }),
}));

jest.mock("@components/profile/ProfileHeader", () => ({
  ProfileHeader: () => null,
}));
jest.mock("@components/profile/FollowRequestBanner", () => ({
  FollowRequestBanner: () => null,
}));
jest.mock("@components/profile/ProfileStatsTab", () => {
  const { View } = jest.requireActual("react-native");
  return {
    ProfileStatsTab: ({ seasonFilter }: { seasonFilter?: React.ReactNode }) => (
      <View testID="profile-stats-tab">{seasonFilter}</View>
    ),
  };
});
jest.mock("@components/game-results/GameResultListItem", () => ({
  GameResultListItem: () => null,
}));
jest.mock("@components/game-results/GamePagination", () => ({
  GamePagination: () => null,
}));

const buildUserDetail = (
  override: Partial<{
    id: number;
    isPrivate: boolean;
    followStatus: "self" | "none" | "pending" | "following";
  }> = {},
) => ({
  data: {
    user: {
      id: override.id ?? 42,
      email: "u@example.com",
      name: "テストユーザー",
      user_id: "test-user",
      image: { url: null },
      introduction: null,
      team_id: null,
      is_private: override.isPrivate ?? false,
      positions: [],
    },
    isFollowing: false,
    follow_status: override.followStatus ?? "none",
    following_count: 0,
    followers_count: 0,
    is_private: override.isPrivate ?? false,
    incoming_follow_request_id: null,
  },
  isLoading: false,
  refetch: jest.fn(),
  isRefreshing: false,
});

const setupDefaultMocks = () => {
  mockUseUserProfileDetail.mockReturnValue(buildUserDetail());
  mockUseFollowUser.mockReturnValue({
    followUser: jest.fn(),
    isFollowing: false,
  });
  mockUseUnfollowUser.mockReturnValue({
    unfollowUser: jest.fn(),
    isUnfollowing: false,
  });
  mockUseUserStats.mockReturnValue({
    battingStats: undefined,
    pitchingStats: undefined,
    isLoading: false,
    refetch: jest.fn(),
    isRefreshing: false,
  });
  mockUseFilteredUserGameResults.mockReturnValue({
    gameResults: [],
    pagination: null,
    isLoading: false,
    isFetching: false,
    isRefreshing: false,
    refetch: jest.fn(),
  });
  mockUseSeasons.mockReturnValue({ seasons: [] });
  mockUseTournaments.mockReturnValue({ tournaments: [] });
  mockUseAvailableYears.mockReturnValue({ years: ["2024", "2023"] });
};

describe("UserProfileScreen ([userId].tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  describe("成績タブのフィルタ", () => {
    it("年度ドロップダウンに useAvailableYears の結果が表示される", () => {
      render(<UserProfileScreen />);
      // 年度ボタン押下でドロップダウンを開く
      fireEvent.press(screen.getByText("年度: 全て"));
      expect(screen.getByText("2024")).toBeTruthy();
      expect(screen.getByText("2023")).toBeTruthy();
    });

    it("年度を選択すると useUserStats に year フィルタが渡される", () => {
      render(<UserProfileScreen />);
      fireEvent.press(screen.getByText("年度: 全て"));
      fireEvent.press(screen.getByText("2024"));

      const lastCall = mockUseUserStats.mock.calls.at(-1);
      expect(lastCall?.[1]).toMatchObject({ year: "2024" });
    });

    it("シーズンを選択すると useUserStats に seasonId フィルタが渡される", () => {
      mockUseSeasons.mockReturnValue({
        seasons: [{ id: 5, name: "2024春" }],
      });
      render(<UserProfileScreen />);
      fireEvent.press(screen.getByText("シーズン: 全て"));
      fireEvent.press(screen.getByText("2024春"));

      const lastCall = mockUseUserStats.mock.calls.at(-1);
      expect(lastCall?.[1]).toMatchObject({ seasonId: "5" });
    });

    it("大会データが0件の場合は大会フィルタが表示されない", () => {
      mockUseTournaments.mockReturnValue({ tournaments: [] });
      render(<UserProfileScreen />);
      expect(screen.queryByText("大会: 全て")).toBeNull();
    });

    it("大会データがある場合は大会フィルタが表示される", () => {
      mockUseTournaments.mockReturnValue({
        tournaments: [{ id: 10, name: "全国大会" }],
      });
      render(<UserProfileScreen />);
      expect(screen.getByText("大会: 全て")).toBeTruthy();
    });
  });

  describe("試合タブのフィルタ・検索・ソート", () => {
    it("試合タブに切り替えるとフィルタ UI と検索ボックスが表示される", () => {
      render(<UserProfileScreen />);
      fireEvent.press(screen.getByText("試合"));
      // 試合タブにも年度などフィルタが表示される
      expect(screen.getAllByText("年度: 全て").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getByPlaceholderText("対戦相手を検索")).toBeTruthy();
      expect(screen.getByText(/日付（新しい順）/)).toBeTruthy();
    });

    it("試合タブで年度を変更すると useFilteredUserGameResults に year が渡される", () => {
      render(<UserProfileScreen />);
      fireEvent.press(screen.getByText("試合"));
      fireEvent.press(screen.getByText("年度: 全て"));
      fireEvent.press(screen.getByText("2024"));

      const lastCall = mockUseFilteredUserGameResults.mock.calls.at(-1);
      expect(lastCall?.[1]).toMatchObject({ year: "2024" });
    });

    it("ソートボタン押下で sort_order が toggle される", () => {
      render(<UserProfileScreen />);
      fireEvent.press(screen.getByText("試合"));
      // 初期状態は新しい順 (desc)
      const initialCall = mockUseFilteredUserGameResults.mock.calls.at(-1);
      expect(initialCall?.[1]).toMatchObject({ sort_order: "desc" });

      fireEvent.press(screen.getByText(/日付（新しい順）/));
      const afterToggle = mockUseFilteredUserGameResults.mock.calls.at(-1);
      expect(afterToggle?.[1]).toMatchObject({ sort_order: "asc" });
    });

    it("対戦相手検索は 300ms debounce 後に search に反映される", () => {
      jest.useFakeTimers();
      try {
        render(<UserProfileScreen />);
        fireEvent.press(screen.getByText("試合"));
        fireEvent.changeText(
          screen.getByPlaceholderText("対戦相手を検索"),
          "横浜",
        );

        // debounce 前は search に反映されない
        const beforeDebounce = mockUseFilteredUserGameResults.mock.calls.at(-1);
        expect(beforeDebounce?.[1]).not.toMatchObject({ search: "横浜" });

        // 300ms 経過させる
        act(() => {
          jest.advanceTimersByTime(300);
        });

        const afterDebounce = mockUseFilteredUserGameResults.mock.calls.at(-1);
        expect(afterDebounce?.[1]).toMatchObject({ search: "横浜" });
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe("タブ切替で activeFilter リセット (#2 修正)", () => {
    it("ドロップダウンを開いたまま試合タブ→成績タブと戻ってもドロップダウンは閉じている", () => {
      render(<UserProfileScreen />);

      // 成績タブで年度ドロップダウンを開く
      fireEvent.press(screen.getByText("年度: 全て"));
      expect(screen.getByText("2024")).toBeTruthy();

      // 試合タブへ切替（成績タブの dropdown はアンマウント）
      fireEvent.press(screen.getByText("試合"));

      // 成績タブに戻る
      fireEvent.press(screen.getByText("成績"));

      // 修正前: activeFilter が "year" のまま残り再オープンしていた
      // 修正後: タブ切替で activeFilter=null になり、ドロップダウンは閉じている
      expect(screen.queryByText("2024")).toBeNull();
    });
  });

  describe("非公開アカウント時のフィルタ非表示", () => {
    it("非公開かつフォロー前の場合、フィルタも成績/試合タブも表示されない", () => {
      mockUseUserProfileDetail.mockReturnValue(
        buildUserDetail({ isPrivate: true, followStatus: "none" }),
      );
      render(<UserProfileScreen />);

      expect(screen.getByText("このアカウントは非公開です")).toBeTruthy();
      expect(screen.queryByText("年度: 全て")).toBeNull();
      expect(screen.queryByText("成績")).toBeNull();
      expect(screen.queryByText("試合")).toBeNull();
    });

    it("非公開でもフォロー済みの場合はフィルタが表示される", () => {
      mockUseUserProfileDetail.mockReturnValue(
        buildUserDetail({ isPrivate: true, followStatus: "following" }),
      );
      render(<UserProfileScreen />);

      expect(screen.queryByText("このアカウントは非公開です")).toBeNull();
      expect(screen.getByText("年度: 全て")).toBeTruthy();
    });
  });

  describe("マスターデータ取得は対象ユーザーIDで呼ばれる", () => {
    it("useSeasons / useTournaments / useAvailableYears に data.user.id が渡される", () => {
      render(<UserProfileScreen />);
      expect(mockUseSeasons).toHaveBeenCalledWith(42);
      expect(mockUseTournaments).toHaveBeenCalledWith(42);
      expect(mockUseAvailableYears).toHaveBeenCalledWith(42);
    });
  });
});
