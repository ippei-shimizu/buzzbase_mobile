/**
 * Step1 試合情報入力画面の振る舞いテスト。
 *
 * - form_defaults API のレスポンスがフォームの初期値に反映される
 *   - match_type / defensive_position / batting_order が直近試合・プロフィール由来の値で初期化される
 * - 必須項目未入力で送信すると Snackbar が出て、フィールド近傍にエラーが表示される
 *
 * 方針:
 * - サービス関数は jest.mock せず、HTTP 層を MSW で intercept する。
 * - 環境境界（expo-router）のみ jest.mock。
 * - 公開 UI 経由で操作し、内部 state は assert しない。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import { useGameRecordStore } from "@stores/gameRecordStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { useSnackbarStore } from "../../../stores/snackbarStore";
import Step1GameInfoScreen from "../step1-game-info";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

beforeEach(() => {
  useGameRecordStore.getState().reset();
  useSnackbarStore.setState({
    visible: false,
    type: "info",
    message: "",
    durationMs: 3000,
    nonce: 0,
  });

  // 画面の初期マウントで走るクエリ群と、ゲーム新規作成 API。
  server.use(
    // 新規作成: gameResult
    http.post(apiUrl("/game_results"), () =>
      HttpResponse.json({ id: 1, user_id: 7 }),
    ),
    // プロフィール（チーム自動セットの参照元）
    http.get(apiUrl("/users/profile"), () =>
      HttpResponse.json({
        id: 7,
        team_id: null,
        positions: [],
      }),
    ),
    // シーズン一覧
    http.get(apiUrl("/seasons/my"), () => HttpResponse.json([])),
  );
});

describe("Step1GameInfoScreen / form_defaults 初期値反映", () => {
  it("form_defaults の match_type / defensive_position / batting_order がフォームに反映される", async () => {
    server.use(
      http.get(apiUrl("/match_results/form_defaults"), () =>
        HttpResponse.json({
          inning_format: 7,
          match_type: "公式戦",
          defensive_position: "ピッチャー",
          batting_order: "5",
        }),
      ),
    );

    renderWithProviders(<Step1GameInfoScreen />);

    await waitFor(() => {
      const s = useGameRecordStore.getState();
      expect(s.inningFormat).toBe(7);
      expect(s.matchType).toBe("公式戦");
      expect(s.defensivePosition).toBe("ピッチャー");
      expect(s.battingOrder).toBe("5");
    });
  });

  it("form_defaults が nil を返した場合は initialState のデフォルトのまま", async () => {
    server.use(
      http.get(apiUrl("/match_results/form_defaults"), () =>
        HttpResponse.json({
          inning_format: 9,
          match_type: null,
          defensive_position: null,
          batting_order: null,
        }),
      ),
    );

    renderWithProviders(<Step1GameInfoScreen />);

    await waitFor(() => {
      // 何度かポーリングして状態が落ち着くのを待つ
      const s = useGameRecordStore.getState();
      expect(s.inningFormat).toBe(9);
      expect(s.matchType).toBe("公式戦");
      // initialState の defensivePosition は ""
      expect(s.defensivePosition).toBe("");
      // initialState の battingOrder は "1"
      expect(s.battingOrder).toBe("1");
    });
  });
});

describe("Step1GameInfoScreen / バリデーション", () => {
  it("必須項目未入力で送信すると Snackbar が表示され、フィールドエラーが描画される", async () => {
    server.use(
      http.get(apiUrl("/match_results/form_defaults"), () =>
        HttpResponse.json({
          inning_format: 9,
          match_type: null,
          defensive_position: null,
          batting_order: null,
        }),
      ),
    );

    const { getByText, findByText } = renderWithProviders(
      <Step1GameInfoScreen />,
    );

    // 初期化完了を待つ（ボタン文言が表示されたら描画OK）
    const submitButton = await findByText("打撃成績入力へ");

    fireEvent.press(submitButton);

    // Snackbar には個別バリデーションメッセージを改行連結した詳細を表示する
    await waitFor(() => {
      const s = useSnackbarStore.getState();
      expect(s.visible).toBe(true);
      expect(s.type).toBe("error");
      expect(s.message).toContain("自チーム名を入力してください");
      expect(s.message).toContain("相手チーム名を入力してください");
      expect(s.message).toContain("自チームの点数を入力してください");
      expect(s.message).toContain("相手チームの点数を入力してください");
    });

    // フィールド近傍のエラー（自チーム / 相手チーム は必須）
    expect(getByText("自チーム名を入力してください")).toBeTruthy();
    expect(getByText("相手チーム名を入力してください")).toBeTruthy();
    // 点数（FormRow は myTeamScore / opponentTeamScore のうちどちらかのメッセージを表示する）
    expect(getByText(/点数を入力してください/)).toBeTruthy();
  });
});
