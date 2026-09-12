/**
 * 試合記録サマリー画面の「野球ノートを記録する」動線の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { useGameRecordStore } from "../../../stores/gameRecordStore";
import SummaryScreen from "../summary";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

const getRouterSpies = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: { replace: jest.Mock } };
  return m.__routerSpies;
};

beforeEach(() => {
  useGameRecordStore.getState().reset();
  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [] }),
    ),
  );
});

describe("SummaryScreen", () => {
  it("「野球ノートを記録する」を押すと、試合を紐付けて野球ノート作成画面へ遷移する", async () => {
    useGameRecordStore.setState({ gameResultId: 123, isEditMode: false });

    renderWithProviders(<SummaryScreen />);

    await waitFor(() =>
      expect(screen.getByText("野球ノートを記録する")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("野球ノートを記録する"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith({
        pathname: "/(note)/new",
        params: { gameResultId: "123" },
      });
    });
  });
});
