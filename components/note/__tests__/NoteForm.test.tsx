/**
 * NoteForm のタグ Pro 制限・複数試合紐付け（無料は1件まで）の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  buildGameResult,
  buildMatchResult,
} from "../../../__tests__/test-utils/factories/gameResult";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS, FREE_FEATURES } from "../../../types/pro";
import { NoteForm } from "../NoteForm";

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const gameA = buildGameResult({
  game_result_id: 1,
  match_result: buildMatchResult({ opponent_team_name: "対戦相手A" }),
});
const gameB = buildGameResult({
  game_result_id: 2,
  match_result: buildMatchResult({ opponent_team_name: "対戦相手B" }),
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
        entitlements: [
          ...FREE_FEATURES,
          "note_tags",
          "multi_game_result_notes",
        ],
      }),
    ),
  );
};

const setupCommonHandlers = () => {
  server.use(
    http.get(baseUrl("/api/v2/practice_sessions"), () => HttpResponse.json([])),
    http.get(baseUrl("/api/v2/note_tags"), () => HttpResponse.json([])),
    http.get(baseUrl("/api/v2/game_results/filtered_index"), () =>
      HttpResponse.json({
        data: [gameA, gameB],
        pagination: {
          current_page: 1,
          per_page: 15,
          total_count: 2,
          total_pages: 1,
        },
      }),
    ),
  );
};

describe("NoteForm", () => {
  it("無料ユーザーはタグ機能がロックされ、タップで Pro 訴求が表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    await waitFor(() =>
      expect(screen.getByText("タグ機能は Pro 限定")).toBeOnTheScreen(),
    );
    expect(
      screen.queryByText("タグ（任意・複数選択可）"),
    ).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText("タグ機能は Pro 限定"));

    expect(screen.getByText("野球ノートにタグを付けて整理")).toBeOnTheScreen();
  });

  it("Proユーザーはタグ選択UIが表示される", async () => {
    respondPro();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    await waitFor(() =>
      expect(screen.getByText("タグ（任意・複数選択可）")).toBeOnTheScreen(),
    );
  });

  it("無料ユーザーは2件目の試合紐付けを試みると Pro 訴求が表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={jest.fn()}
        initial={{ gameResultIds: [gameA.game_result_id] }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("試合をもう1件追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("試合をもう1件追加"));

    expect(
      screen.getByText("1つのノートに複数の試合を紐付け"),
    ).toBeOnTheScreen();
    // Pro 訴求が出ただけで、ピッカーの検索ボックスは開かない。
    expect(
      screen.queryByPlaceholderText("対戦相手で検索"),
    ).not.toBeOnTheScreen();
  });

  it("Proユーザーは2件目の試合を選んで紐付けられる", async () => {
    respondPro();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={jest.fn()}
        initial={{ gameResultIds: [gameA.game_result_id] }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("試合をもう1件追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("試合をもう1件追加"));

    await waitFor(() =>
      expect(screen.getByText(/対戦相手B/)).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText(/対戦相手B/));

    await waitFor(() =>
      expect(screen.getAllByText(/対戦相手/)).toHaveLength(2),
    );
    expect(
      screen.queryByPlaceholderText("対戦相手で検索"),
    ).not.toBeOnTheScreen();
  });
});
