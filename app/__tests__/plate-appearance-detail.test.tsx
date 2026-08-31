/**
 * 打席詳細画面の振る舞いテスト。
 *
 * 検証対象:
 * - GET /api/v2/plate_appearances/:id のレスポンスが各セクションに表示される
 * - 全 null の打席では「未記録」表示になり、条件付き行（三振の種類など）は出ない
 * - 記録者本人にだけ「この打席を編集」が表示され、編集ルートへ push される
 *
 * 方針: HTTP 境界は MSW で intercept し、expo-router のみ jest.mock する。
 */
import type { RouterSpies } from "../../__tests__/test-utils/mockExpoRouter";
import type { PlateAppearanceV2 } from "../../types/plateAppearance";
import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import PlateAppearanceDetailScreen from "../plate-appearance-detail";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({
    searchParams: { id: "10", gameResultId: "5" },
  });
});

const getRouterSpies = () => {
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

const buildDetailPlateAppearance = (
  overrides: Partial<PlateAppearanceV2> = {},
): PlateAppearanceV2 => ({
  id: 10,
  game_result_id: 5,
  user_id: 1,
  batter_box_number: 2,
  batting_result: "中安",
  plate_result_id: 7,
  hit_direction_id: 10,
  batting_position_id: null,
  out_type: null,
  hit_type: "single",
  swing_type: null,
  hit_location_x: "0.500",
  hit_location_y: "0.300",
  rbi: 0,
  run_scored: 1,
  stolen_bases: null,
  caught_stealing: null,
  final_balls: 3,
  final_strikes: 2,
  final_outs: 1,
  first_pitch_swing: false,
  runners_state: "first_second",
  inning: 7,
  pitch_course: 13,
  pitch_course_x: "0.512",
  pitch_course_y: "0.436",
  self_analysis_memo: "低めを我慢できた",
  opponent_memo: null,
  is_new_format: true,
  has_detail_data: true,
  contact_quality: { id: 1, name: "芯", display_order: 1 },
  timing: { id: 2, name: "ジャスト", display_order: 2 },
  pitch_type: { id: 1, name: "ストレート系", display_order: 1 },
  pitcher: null,
  appearance_situation: null,
  created_at: "2026-08-01T00:00:00+09:00",
  updated_at: "2026-08-01T00:00:00+09:00",
  ...overrides,
});

const mockProfile = (id: number) => {
  server.use(
    http.get(baseUrl("/api/v1/user"), () =>
      HttpResponse.json({
        id,
        email: "test@example.com",
        name: "テストユーザー",
        user_id: "test_user",
        image: { url: null },
        introduction: null,
        team_id: null,
        is_private: false,
        positions: [],
        throw_hand: null,
        batting_side: null,
      }),
    ),
  );
};

const mockPlateAppearance = (pa: PlateAppearanceV2) => {
  server.use(
    http.get(baseUrl(`/api/v2/plate_appearances/${pa.id}`), () =>
      HttpResponse.json(pa),
    ),
  );
};

describe("PlateAppearanceDetailScreen", () => {
  it("相互フォローでない他ユーザーの打席は閲覧できない旨を表示する", async () => {
    mockProfile(1);
    server.use(
      http.get(baseUrl("/api/v2/plate_appearances/10"), () =>
        HttpResponse.json(
          {
            error: "mutual_follow_required",
            message: "相互フォローのユーザーのみ閲覧できます",
          },
          { status: 403 },
        ),
      ),
    );

    const { findByText, queryByText } = renderWithProviders(
      <PlateAppearanceDetailScreen />,
    );

    expect(
      await findByText("相互フォローのユーザーのみ打席詳細を閲覧できます"),
    ).toBeTruthy();
    expect(queryByText("中安")).toBeNull();
  });

  it("フル記録の打席は各項目が表示される", async () => {
    mockProfile(1);
    mockPlateAppearance(buildDetailPlateAppearance());

    const { findByText, getByText, getByLabelText } = renderWithProviders(
      <PlateAppearanceDetailScreen />,
    );

    expect(await findByText("中安")).toBeTruthy();
    expect(getByText("第2打席")).toBeTruthy();
    expect(getByText("7回")).toBeTruthy();
    expect(getByText("ヒット種別")).toBeTruthy();
    expect(getByText("単打")).toBeTruthy();
    // BSO ボード・ダイヤモンドは表示専用
    expect(getByLabelText("カウント ボール3 ストライク2 アウト1")).toBeTruthy();
    expect(getByLabelText("ランナー状況: 一・二塁")).toBeTruthy();
    expect(getByText("真ん中（ストライク）")).toBeTruthy();
    expect(getByLabelText("コース図")).toBeTruthy();
    // 打点 0 は未記録ではなく 0 のまま表示する
    expect(getByText("打点")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
    expect(getByText("低めを我慢できた")).toBeTruthy();
  });

  it("全 null の打席は未記録が表示され、条件付き行は出ない", async () => {
    mockProfile(1);
    mockPlateAppearance(
      buildDetailPlateAppearance({
        hit_type: null,
        out_type: null,
        swing_type: null,
        hit_direction_id: null,
        hit_location_x: null,
        hit_location_y: null,
        final_balls: null,
        final_strikes: null,
        final_outs: null,
        first_pitch_swing: null,
        runners_state: null,
        inning: null,
        pitch_course: null,
        rbi: null,
        run_scored: null,
        self_analysis_memo: null,
        contact_quality: null,
        timing: null,
        pitch_type: null,
      }),
    );

    const { findByText, queryByText, getAllByText } = renderWithProviders(
      <PlateAppearanceDetailScreen />,
    );

    expect(await findByText("中安")).toBeTruthy();
    // 三振でない打席に「三振の種類」の行を出さない
    expect(queryByText("三振の種類")).toBeNull();
    expect(queryByText("ヒット種別")).toBeNull();
    // メモが無ければセクションごと出さない
    expect(queryByText("メモ")).toBeNull();
    expect(getAllByText("未記録").length).toBeGreaterThan(0);
  });

  it("記録者本人には編集ボタンが出て、編集ルートへ push される", async () => {
    mockProfile(1);
    mockPlateAppearance(buildDetailPlateAppearance());

    const { findByLabelText } = renderWithProviders(
      <PlateAppearanceDetailScreen />,
    );

    const editButton = await findByLabelText("この打席を編集");
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(getRouterSpies().push).toHaveBeenCalledWith({
        pathname: "/(game-record)/plate-appearances/[id]/edit",
        params: { id: "10", gameResultId: "5" },
      });
    });
  });

  it("他人の打席では編集ボタンを出さない", async () => {
    mockProfile(99);
    mockPlateAppearance(buildDetailPlateAppearance());

    const { findByText, queryByLabelText } = renderWithProviders(
      <PlateAppearanceDetailScreen />,
    );

    expect(await findByText("中安")).toBeTruthy();
    await waitFor(() => {
      expect(queryByLabelText("この打席を編集")).toBeNull();
    });
  });
});
