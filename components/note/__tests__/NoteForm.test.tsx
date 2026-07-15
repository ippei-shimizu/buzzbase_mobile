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
import {
  createTestQueryClient,
  renderWithProviders,
} from "../../../__tests__/test-utils/renderWithProviders";
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

const themeA = {
  id: 1,
  title: "外角対応",
  category: "batting",
  purpose: null,
  status: "open" as const,
  started_on: "2026-06-01",
  achieved_on: null,
  sort_order: 0,
  practice_logs_count: 0,
  notes_count: 0,
  active_days: 0,
  created_at: "2026-06-01T00:00:00+09:00",
};
const themeB = { ...themeA, id: 2, title: "肩の開きを抑える" };

const PRO_STATUS = {
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
    "multi_improvement_theme_links",
  ],
};

const respondFree = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
  );
};

const respondPro = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () => HttpResponse.json(PRO_STATUS)),
  );
};

// pro/status の取得完了を待たずに Pro 限定 UI を操作するテストがあるため、
// レンダー前にクエリキャッシュへ Pro 状態を注入して初回描画から反映させる。
const buildProQueryClient = () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(["pro", "status"], PRO_STATUS);
  return queryClient;
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
    http.get(baseUrl("/api/v2/improvement_themes"), () =>
      HttpResponse.json([themeA, themeB]),
    ),
  );
};

describe("NoteForm", () => {
  it("無料ユーザーにはタグ選択UIの上に Pro 訴求オーバーレイが重なって表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    // UI自体（Proユーザーと同じ見た目）は見える。
    await waitFor(() =>
      expect(screen.getByText("タグ（任意・複数選択可）")).toBeOnTheScreen(),
    );
    // オーバーレイのメリット訴求文言も見える。
    expect(screen.getByText("タグでノートを整理・検索")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro に加入する"));

    expect(screen.getByText("野球ノートにタグを付けて整理")).toBeOnTheScreen();
  });

  it("Proユーザーはタグ選択UIが操作できる", async () => {
    respondPro();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    await waitFor(() =>
      expect(screen.getByText("タグ（任意・複数選択可）")).toBeOnTheScreen(),
    );
    expect(
      screen.queryByText("タグでノートを整理・検索"),
    ).not.toBeOnTheScreen();
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
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={jest.fn()}
        initial={{ gameResultIds: [gameA.game_result_id] }}
      />,
      { queryClient: buildProQueryClient() },
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

  it("無料ユーザーは2件目の課題紐付けを試みると Pro 訴求が表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={jest.fn()}
        initial={{ improvementThemeIds: [themeA.id] }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("課題をもう1件追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("課題をもう1件追加"));

    expect(screen.getByText("1つの記録に複数の課題を紐付け")).toBeOnTheScreen();
    expect(screen.queryByText(themeB.title)).not.toBeOnTheScreen();
  });

  it("Proユーザーは2件目の課題を選んで紐付けられる", async () => {
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={jest.fn()}
        initial={{ improvementThemeIds: [themeA.id] }}
      />,
      { queryClient: buildProQueryClient() },
    );

    await waitFor(() =>
      expect(screen.getByText("課題をもう1件追加")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("課題をもう1件追加"));

    await waitFor(() =>
      expect(screen.getByText(themeB.title)).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText(themeB.title));

    await waitFor(() =>
      expect(screen.getAllByText(themeB.title)).toHaveLength(1),
    );
    expect(screen.getByText(themeA.title)).toBeOnTheScreen();
  });
});
