/**
 * グループタブ画面の振る舞いテスト（初回招待ツールチップ）。
 *
 * 方針:
 * - 公開 UI から操作し、SecureStore フラグと表示の変化を検証する。
 * - HTTP は MSW で intercept（services を jest.mock しない）。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
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
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// ナビゲーション境界: テストにはヘッダーコンテキストが無く useHeaderHeight が throw するためモックする
jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 0,
}));

const getItemAsyncMock = SecureStore.getItemAsync as jest.Mock;

const renderGroupsTab = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GroupsTabScreen = require("../index").default;
  return renderWithProviders(<GroupsTabScreen />);
};

beforeEach(() => {
  jest.clearAllMocks();
  server.use(http.get(apiUrl("/groups"), () => HttpResponse.json([])));
});

describe("グループタブ 招待ツールチップ", () => {
  it("初回はツールチップを表示し、閉じると消える", async () => {
    getItemAsyncMock.mockResolvedValue(null);

    const { getByText, getByLabelText, queryByText } = renderGroupsTab();

    await waitFor(() => {
      expect(
        getByText("チームメイトから招待コードをもらって参加しよう"),
      ).toBeTruthy();
    });

    fireEvent.press(getByLabelText("ヒントを閉じる"));

    expect(
      queryByText("チームメイトから招待コードをもらって参加しよう"),
    ).toBeNull();
  });

  it("表示済みフラグがあればツールチップを表示しない", async () => {
    getItemAsyncMock.mockResolvedValue("1");

    const { queryByText, getByText } = renderGroupsTab();

    await waitFor(() => {
      expect(getByText("招待コードでグループに参加")).toBeTruthy();
    });
    expect(
      queryByText("チームメイトから招待コードをもらって参加しよう"),
    ).toBeNull();
  });
});
