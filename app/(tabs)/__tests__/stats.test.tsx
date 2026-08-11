/**
 * 成績画面の振る舞いテスト。
 * 打撃と投球の切り替えで、表示中のタブの内容だけが見えることを担保する。
 * この画面はタブ本文が広く、横スワイプ対応で構造を変えるため回帰の網として置く。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import StatsScreen from "../stats";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
}));

const STATS_PATHS = [
  "headline_stats",
  "additional_stats",
  "batting_trend",
  "era_trend",
  "runners_situation",
  "count_situations",
  "contact_qualities",
  "hit_directions",
  "hit_locations",
  "pitch_types",
  "pitcher_faceoffs",
  "pitcher_attribute_summary",
  "plate_appearance_breakdown",
  "timing_breakdown",
];

/** 成績画面はマウント時に多数のクエリを走らせるため、まとめて空を返す。 */
const respondWithEmptyStats = () => {
  server.use(
    ...STATS_PATHS.map((path) =>
      http.get(baseUrl(`/api/v2/stats/${path}`), () => HttpResponse.json({})),
    ),
    http.get(baseUrl("/api/v2/stats/batting"), () => HttpResponse.json([])),
    http.get(baseUrl("/api/v2/stats/pitching"), () => HttpResponse.json([])),
    http.get(apiUrl("/match_results/available_years"), () =>
      HttpResponse.json([]),
    ),
    http.get(apiUrl("/seasons"), () => HttpResponse.json([])),
  );
};

describe("成績画面のタブ切り替え", () => {
  it("既定では打撃の内容を表示する", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    expect(screen.queryByText("投球成績")).toBeNull();
  });

  it("投球タブに切り替えると投球の内容だけを表示する", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("投球"));

    await waitFor(() => expect(screen.getByText("投球成績")).toBeOnTheScreen());
    expect(screen.queryByText("打撃成績")).toBeNull();
  });

  it("打撃タブへ戻せる", async () => {
    respondWithEmptyStats();
    renderWithProviders(<StatsScreen />);

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("投球"));
    await waitFor(() => expect(screen.getByText("投球成績")).toBeOnTheScreen());
    fireEvent.press(screen.getByText("打撃"));

    await waitFor(() => expect(screen.getByText("打撃成績")).toBeOnTheScreen());
    expect(screen.queryByText("投球成績")).toBeNull();
  });
});
