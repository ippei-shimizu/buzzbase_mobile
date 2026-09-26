/**
 * 打席記録フローの「game record step viewed」計測の結合テスト。
 * 打席リスト表示と、編集モードのウィザードがステップ計測に混ざらないことを見る。
 */
import { useBattingRecordStore } from "@stores/battingRecordStore";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { buildPlateAppearanceV2 } from "../../../../__tests__/test-utils/factories/plateAppearance";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import EditPlateAppearanceScreen from "../[id]/edit";
import PlateAppearancesListScreen from "../index";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "555" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

const mockCapture = jest.fn();
jest.mock("@utils/posthog", () => ({
  posthog: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

const viewedGameRecordSteps = () =>
  mockCapture.mock.calls
    .filter(([event]) => event === "game record step viewed")
    .map(([, properties]) => properties.step);

beforeEach(() => {
  mockCapture.mockClear();
  useGameRecordStore.getState().reset();
  useBattingRecordStore.getState().reset();
  useGameRecordStore.setState({
    gameResultId: 123,
    userId: 7,
    recordPattern: "batting",
  });

  server.use(
    http.get(baseUrl("/api/v2/plate_appearances/by_game/123"), () =>
      HttpResponse.json({ plate_appearances: [buildPlateAppearanceV2()] }),
    ),
  );
});

describe("打席記録フローのステップ計測", () => {
  it("打席リストを表示すると plate_appearances として計測する", async () => {
    const view = renderWithProviders(<PlateAppearancesListScreen />);
    await view.findByLabelText("第1打席 中安");

    expect(viewedGameRecordSteps()).toEqual(["plate_appearances"]);
  });

  it("試合情報が無くエラー表示になる場合は打席リストの到達として計測しない", async () => {
    useGameRecordStore.setState({ gameResultId: null });
    const view = renderWithProviders(<PlateAppearancesListScreen />);
    await view.findByText(
      "試合情報が見つかりません。試合記録を最初からやり直してください。",
    );

    expect(viewedGameRecordSteps()).toEqual([]);
  });

  it("既存打席の編集ではウィザードのステップを計測しない", async () => {
    const view = renderWithProviders(<EditPlateAppearanceScreen />);
    await view.findByRole("button", { name: "この打席を更新" });

    expect(viewedGameRecordSteps()).toEqual([]);
  });
});
