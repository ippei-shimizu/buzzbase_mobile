/**
 * 記録ウィザードを×ボタン以外（スワイプ／物理戻る）で離脱したときの
 * サーバー側ドラフト削除の振る舞いテスト。
 */
import type { NavigationSpies } from "../../../__tests__/test-utils/mockExpoRouter";
import { waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import GameRecordLayout from "../_layout";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getNavigationSpies = (): NavigationSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __navigationSpies: NavigationSpies };
  return m.__navigationSpies;
};

const DRAFT_GAME_RESULT_ID = 55;

const deletedIds: string[] = [];

beforeEach(() => {
  deletedIds.length = 0;
  useGameRecordStore.getState().reset();
  // 「中断する」を選んだ状態を再現する。
  jest
    .spyOn(Alert, "alert")
    .mockImplementation((_title, _message, buttons) =>
      buttons?.find((button) => button.style === "destructive")?.onPress?.(),
    );
  server.use(
    http.delete(apiUrl("/game_results/:id"), ({ params }) => {
      deletedIds.push(params.id as string);
      return new HttpResponse(null, { status: 204 });
    }),
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** スワイプ／物理戻るによる離脱を再現する。 */
const leaveByGesture = () =>
  getNavigationSpies().emit("beforeRemove", {
    preventDefault: jest.fn(),
    data: { action: { type: "GO_BACK" } },
  });

describe("記録ウィザードのドラフト削除", () => {
  it("新規記録モードでスワイプ離脱すると未完成ドラフトが削除される", async () => {
    useGameRecordStore.setState({
      isEditMode: false,
      gameResultId: DRAFT_GAME_RESULT_ID,
    });

    renderWithProviders(<GameRecordLayout />);
    leaveByGesture();

    await waitFor(() =>
      expect(deletedIds).toEqual([String(DRAFT_GAME_RESULT_ID)]),
    );
    expect(getNavigationSpies().dispatch).toHaveBeenCalled();
  });

  it("編集モードでスワイプ離脱しても既存の試合結果は削除しない", async () => {
    useGameRecordStore.setState({
      isEditMode: true,
      gameResultId: DRAFT_GAME_RESULT_ID,
    });

    renderWithProviders(<GameRecordLayout />);
    leaveByGesture();

    await waitFor(() =>
      expect(getNavigationSpies().dispatch).toHaveBeenCalled(),
    );
    expect(deletedIds).toEqual([]);
  });

  it("記録完了後の遷移では確認ダイアログを出さずにそのまま離脱する", async () => {
    renderWithProviders(<GameRecordLayout />);
    leaveByGesture();

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(deletedIds).toEqual([]);
  });
});
