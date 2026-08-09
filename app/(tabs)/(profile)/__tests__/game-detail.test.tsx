/**
 * マイページ経由の試合詳細画面の振る舞いテスト。
 * 自分の試合結果のときだけ編集・削除の動線が出ることを確認する。
 */
import { screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import ProfileGameDetailScreen from "../game-detail";

const OWNER_USER_ID = 1;
const OTHER_USER_ID = 2;

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  const {
    buildGameResult: build,
  } = require("../../../../__tests__/test-utils/factories/gameResult");
  return buildExpoRouterMock({
    renderScreenOptions: true,
    searchParams: { game: JSON.stringify(build({ user_id: 1 })) },
  });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const useProfileOf = (userId: number) => {
  server.use(
    http.get(apiUrl("/user"), () =>
      HttpResponse.json({ id: userId, name: "テスト太郎" }),
    ),
  );
};

describe("ProfileGameDetailScreen", () => {
  it("自分の試合結果では編集・削除の動線が出る", async () => {
    useProfileOf(OWNER_USER_ID);

    renderWithProviders(<ProfileGameDetailScreen />);

    await waitFor(() =>
      expect(screen.getByLabelText("試合結果を編集")).toBeOnTheScreen(),
    );
    expect(screen.getByLabelText("試合結果を削除")).toBeOnTheScreen();
  });

  it("他ユーザーの試合結果では編集・削除の動線が出ない（共有のみ）", async () => {
    useProfileOf(OTHER_USER_ID);

    renderWithProviders(<ProfileGameDetailScreen />);

    await waitFor(() =>
      expect(screen.getByLabelText("試合結果を共有")).toBeOnTheScreen(),
    );
    expect(screen.queryByLabelText("試合結果を編集")).not.toBeOnTheScreen();
    expect(screen.queryByLabelText("試合結果を削除")).not.toBeOnTheScreen();
  });
});
