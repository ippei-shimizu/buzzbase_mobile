import { act, fireEvent, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../../jest-setup-msw";
import { PitcherSelector } from "../PitcherSelector";

const PITCHER = {
  id: 1,
  name: "田中",
  throw_hand: "right",
  team_id: 5,
  arm_angle: null,
  velocity_zone: null,
  pitcher_style: null,
  memo: null,
};

/** パラメータ無しの GET /teams（全件取得）が飛んだかを記録する。 */
const trackUnscopedTeamsRequest = () => {
  const tracker = { requested: false };
  server.use(
    http.get(apiUrl("/teams"), ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      if (searchParams.has("q") || searchParams.has("limit")) {
        return HttpResponse.json([]);
      }
      tracker.requested = true;
      // サーバーは今もパラメータ無しで全件を返すため、全件取得でも表示は成立してしまう
      return HttpResponse.json([{ id: 5, name: "東高校" }]);
    }),
  );
  return tracker;
};

beforeEach(() => {
  server.use(
    http.get(baseUrl("/api/v2/pitchers"), () =>
      HttpResponse.json({
        data: [PITCHER],
        pagination: {
          current_page: 1,
          per_page: 20,
          total_count: 1,
          total_pages: 1,
        },
      }),
    ),
    http.get(apiUrl("/teams/5/team_name"), () =>
      HttpResponse.json({ name: "東高校" }),
    ),
    http.get(baseUrl("/api/v2/arm_angles"), () =>
      HttpResponse.json({ arm_angles: [] }),
    ),
    http.get(baseUrl("/api/v2/velocity_zones"), () =>
      HttpResponse.json({ velocity_zones: [] }),
    ),
    http.get(baseUrl("/api/v2/pitcher_styles"), () =>
      HttpResponse.json({ pitcher_styles: [] }),
    ),
  );
});

describe("PitcherSelector", () => {
  it("投手一覧に所属チーム名を表示し、チームの全件取得はしない", async () => {
    const tracker = trackUnscopedTeamsRequest();
    const screen = renderWithProviders(
      <PitcherSelector value={null} onChange={jest.fn()} />,
    );

    fireEvent.press(screen.getByLabelText("投手を選択"));

    expect(await screen.findByText("東高校 / 右投げ")).toBeTruthy();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(tracker.requested).toBe(false);
  });

  it("投手の編集フォームに所属チーム名を表示する", async () => {
    const screen = renderWithProviders(
      <PitcherSelector value={null} onChange={jest.fn()} />,
    );

    fireEvent.press(screen.getByLabelText("投手を選択"));
    fireEvent.press(await screen.findByLabelText("投手 田中 を編集"));

    await waitFor(() => {
      expect(screen.getByText("所属チーム")).toBeTruthy();
    });
    expect(screen.getByText("東高校")).toBeTruthy();
  });
});
