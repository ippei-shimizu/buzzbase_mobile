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

// メディア選択（撮影/ライブラリ）はネイティブ境界のためモックする。
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: "file:///picked-photo.jpg",
        type: "image",
        mimeType: "image/jpeg",
        width: 100,
        height: 100,
      },
    ],
  }),
  launchCameraAsync: jest.fn(),
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
    // オーバーレイのカードは pro/status 解決前（isProLoading 中）は描画されないため、
    // 解決を待ってから見出し・メリット訴求文言（箇条書き）を検証する。
    await waitFor(() =>
      expect(
        screen.getByText("野球ノートにタグを付けて整理"),
      ).toBeOnTheScreen(),
    );
    expect(
      screen.getByText(
        "・練習の気づきや試合の振り返りをタグで分類\n・過去のノートをタグから素早く検索\n・自分専用のタグも自由に作成可能",
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Pro プランを見る"));

    // オーバーレイと PaywallModal 両方に見出しが出るため複数ヒットで開いたことを確認する。
    expect(
      screen.getAllByText("野球ノートにタグを付けて整理").length,
    ).toBeGreaterThan(1);
  });

  it("Proユーザーはタグ選択UIが操作できる", async () => {
    respondPro();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    await waitFor(() =>
      expect(
        screen.queryByText("野球ノートにタグを付けて整理"),
      ).not.toBeOnTheScreen(),
    );
    expect(screen.getByText("タグ（任意・複数選択可）")).toBeOnTheScreen();
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

  it("新規作成時（noteId未指定）でもメディア選択ボタンが表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm submitLabel="保存" isSubmitting={false} onSubmit={jest.fn()} />,
    );

    await waitFor(() =>
      expect(screen.getByText("メディア（任意）")).toBeOnTheScreen(),
    );
    expect(screen.getByText("撮影")).toBeOnTheScreen();
    expect(screen.getByText("ライブラリ")).toBeOnTheScreen();
  });

  it("新規作成時に選んだメディアはアップロードせずローカルに保持され、保存時にonSubmitへ渡される", async () => {
    respondFree();
    setupCommonHandlers();
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <NoteForm
        submitLabel="保存"
        isSubmitting={false}
        onSubmit={handleSubmit}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("ライブラリ")).toBeOnTheScreen(),
    );
    fireEvent.press(screen.getByText("ライブラリ"));

    // アップロードAPIは呼ばれず、ローカルプレビュー（サムネイル画像）だけが増える。
    await waitFor(() =>
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0),
    );

    fireEvent.changeText(
      screen.getByPlaceholderText(/外角が体の開きで詰まる/),
      "テストメモ",
    );
    fireEvent.press(screen.getByText("保存"));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
    const [, stagedMedia] = handleSubmit.mock.calls[0];
    expect(stagedMedia).toEqual([
      expect.objectContaining({
        uri: "file:///picked-photo.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
      }),
    ]);
  });

  it("noteId指定時（編集画面）はメディア追加ボタンと既存添付一覧が表示される", async () => {
    respondFree();
    setupCommonHandlers();

    renderWithProviders(
      <NoteForm
        submitLabel="更新"
        isSubmitting={false}
        onSubmit={jest.fn()}
        noteId={99}
        mediaAttachments={[
          {
            id: 1,
            media_type: "image",
            status: "ready",
            file_size_bytes: 12_345,
            duration_seconds: null,
            width: 1080,
            height: 1920,
            position: 0,
            playback_url: "https://media.test/image.jpg",
            thumbnail_url: null,
            created_at: "2026-07-20T00:00:00Z",
          },
        ]}
      />,
    );

    await waitFor(() => expect(screen.getByText("撮影")).toBeOnTheScreen());
    expect(screen.getByText("ライブラリ")).toBeOnTheScreen();
    expect(
      screen.queryByText("保存後に画像・動画を追加できます"),
    ).not.toBeOnTheScreen();
  });
});
