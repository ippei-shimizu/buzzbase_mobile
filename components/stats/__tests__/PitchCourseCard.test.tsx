/**
 * コース別分析カードの振る舞いテスト。
 *
 * 検証対象:
 * - 打数 0 のセルは "-" 表示（色スケールの対象外）
 * - 各セルに打率と分母（N打数）を併記し、min_at_bats 未満は参考値の注記を出す
 * - 指標（打席分布 / 打率 / 長打率 / 三振率）と粒度（5x5 / 3x3 / 高低・内外 / ゾーン内外）を切り替えられ、
 *   タブを切り替えても選択が保持される
 * - total_target_pa が 0 のときはヒートマップを出さず空状態を表示する
 * - 「球種別」タブを開いたときにだけクロス集計 API を取得する（サンプル指定時は API を呼ばない）
 * - 「投手別」タブを開いたときにだけ投手×コース API を取得し、セレクトで投手を切り替えられる
 */
import type { PitchCourseData, PitchCourseZone } from "../../../types/stats";
import { act, fireEvent } from "@testing-library/react-native";
import React from "react";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { PitchCourseCard } from "../PitchCourseCard";

const buildZone = (
  course: number,
  overrides: Partial<PitchCourseZone> = {},
): PitchCourseZone => ({
  course,
  row: Math.floor((course - 1) / 5) + 1,
  col: ((course - 1) % 5) + 1,
  is_strike_zone: [7, 8, 9, 12, 13, 14, 17, 18, 19].includes(course),
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
  batting_average: 0,
  is_reliable: false,
  ...overrides,
});

const EMPTY_SUMMARY = {
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
  batting_average: 0,
};

const buildData = (
  zoneOverrides: Record<number, Partial<PitchCourseZone>> = {},
  overrides: Partial<PitchCourseData> = {},
): PitchCourseData => {
  const zones = Array.from({ length: 25 }, (_, index) =>
    buildZone(index + 1, zoneOverrides[index + 1] ?? {}),
  );
  const totalPa = zones.reduce((sum, z) => sum + z.plate_appearances, 0);
  return {
    zones,
    strike_zone: EMPTY_SUMMARY,
    ball_zone: EMPTY_SUMMARY,
    total_target_pa: totalPa,
    min_at_bats: 3,
    ...overrides,
  };
};

/** マウントやタブ切替で発火したリクエストが MSW に届くまで待つ。 */
const flushPendingRequests = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

describe("PitchCourseCard", () => {
  it("打数 0 のセルは '-' 表示になる", () => {
    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getAllByText, getByText } = renderWithProviders(
      <PitchCourseCard data={data} />,
    );
    // 25 マス中 24 マスと、ストライク / ボールゾーンの集計（fixture では 0 打数）
    expect(getAllByText("-")).toHaveLength(26);
    expect(getByText(".400")).toBeTruthy();
  });

  it("セルに打数を併記し、打数が 3 未満なら参考値の注記を出す", () => {
    const data = buildData({
      13: {
        plate_appearances: 2,
        at_bats: 2,
        hits: 1,
        batting_average: 0.5,
        is_reliable: false,
      },
    });
    const { getByText } = renderWithProviders(<PitchCourseCard data={data} />);
    expect(getByText(".500")).toBeTruthy();
    expect(getByText("2打数")).toBeTruthy();
    expect(getByText("打数が3未満のコースは参考値です")).toBeTruthy();
    expect(getByText("捕手目線で表示しています")).toBeTruthy();
  });

  it("対象打席 0 のときは空状態を表示する", () => {
    const { getByText, queryByText } = renderWithProviders(
      <PitchCourseCard data={buildData()} />,
    );
    expect(
      getByText("詳細記録でコースを入力すると分析が表示されます"),
    ).toBeTruthy();
    expect(queryByText("捕手目線で表示しています")).toBeNull();
  });

  it("球種別タブを開いたときにだけクロス集計を取得する", async () => {
    let crossRequested = false;
    server.use(
      http.get(baseUrl("/api/v2/stats/pitch_course_pitch_types"), () => {
        crossRequested = true;
        return HttpResponse.json({
          rows: [
            {
              id: 1,
              label: "ストレート系",
              plate_appearances: 5,
              zones: buildData({
                13: {
                  plate_appearances: 5,
                  at_bats: 5,
                  hits: 3,
                  batting_average: 0.6,
                  is_reliable: true,
                },
              }).zones,
            },
          ],
          total_target_pa: 5,
          min_at_bats: 3,
        });
      }),
    );

    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText, findByText } = renderWithProviders(
      <PitchCourseCard data={data} crossFilters={{}} />,
    );

    await flushPendingRequests();
    expect(crossRequested).toBe(false);
    fireEvent.press(getByText("球種別"));
    expect(await findByText("ストレート系 (5)")).toBeTruthy();
    expect(crossRequested).toBe(true);
    expect(await findByText(".600")).toBeTruthy();
  });

  it("投手別タブを開いたときにだけ取得し、選んだ投手のコース別打率を表示する", async () => {
    let pitcherCrossRequested = false;
    server.use(
      http.get(baseUrl("/api/v2/stats/pitcher_faceoff_courses"), () => {
        pitcherCrossRequested = true;
        return HttpResponse.json({
          rows: [
            {
              id: 11,
              label: "エース投手",
              team_name: "相手高校",
              plate_appearances: 5,
              zones: buildData({
                19: {
                  plate_appearances: 5,
                  at_bats: 5,
                  hits: 4,
                  batting_average: 0.8,
                  is_reliable: true,
                },
              }).zones,
            },
            {
              id: 12,
              label: "控え投手",
              team_name: null,
              plate_appearances: 3,
              zones: buildData({
                7: {
                  plate_appearances: 3,
                  at_bats: 3,
                  hits: 0,
                  batting_average: 0,
                  is_reliable: true,
                },
              }).zones,
            },
          ],
          total_target_pa: 8,
          min_at_bats: 3,
          min_plate_appearances: 3,
        });
      }),
    );

    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText, getByLabelText, findByText, queryByText } =
      renderWithProviders(<PitchCourseCard data={data} crossFilters={{}} />);

    await flushPendingRequests();
    expect(pitcherCrossRequested).toBe(false);
    fireEvent.press(getByText("投手別"));
    expect(await findByText("エース投手（相手高校） 5打席")).toBeTruthy();
    expect(pitcherCrossRequested).toBe(true);
    expect(getByText(".800")).toBeTruthy();

    fireEvent.press(getByLabelText("対戦投手"));
    fireEvent.press(getByText("控え投手 3打席"));
    expect(getByText(".000")).toBeTruthy();
    expect(queryByText(".800")).toBeNull();

    fireEvent.press(getByText("コース別"));
    fireEvent.press(getByText("投手別"));
    expect(await findByText(".000")).toBeTruthy();
    expect(queryByText(".800")).toBeNull();
  });

  it("しきい値以上の投手がいなければその旨を表示する", async () => {
    server.use(
      http.get(baseUrl("/api/v2/stats/pitcher_faceoff_courses"), () =>
        HttpResponse.json({
          rows: [],
          total_target_pa: 2,
          min_at_bats: 3,
          min_plate_appearances: 3,
        }),
      ),
    );
    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText, findByText } = renderWithProviders(
      <PitchCourseCard data={data} crossFilters={{}} />,
    );

    fireEvent.press(getByText("投手別"));
    expect(
      await findByText("コースを記録した対戦が3打席以上の投手がいません"),
    ).toBeTruthy();
  });

  it("サンプル指定時は球種別タブを出さず、API を呼ばずに投手別タブを表示する", () => {
    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText, queryByText } = renderWithProviders(
      <PitchCourseCard
        data={data}
        samplePitcherCross={{
          rows: [
            {
              id: 1,
              label: "投手 C",
              team_name: null,
              plate_appearances: 3,
              zones: data.zones,
            },
          ],
          total_target_pa: 3,
          min_at_bats: 3,
          min_plate_appearances: 3,
        }}
      />,
    );

    expect(queryByText("球種別")).toBeNull();
    fireEvent.press(getByText("投手別"));
    expect(getByText("投手 C 3打席")).toBeTruthy();
  });

  it("サンプル指定時はフィルタを渡されていても投手別の API を呼ばない", async () => {
    let pitcherCrossRequested = false;
    server.use(
      http.get(baseUrl("/api/v2/stats/pitcher_faceoff_courses"), () => {
        pitcherCrossRequested = true;
        return HttpResponse.json({
          rows: [],
          total_target_pa: 0,
          min_at_bats: 3,
          min_plate_appearances: 3,
        });
      }),
    );
    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText } = renderWithProviders(
      <PitchCourseCard
        data={data}
        crossFilters={{}}
        samplePitcherCross={{
          rows: [
            {
              id: 1,
              label: "投手 C",
              team_name: null,
              plate_appearances: 3,
              zones: data.zones,
            },
          ],
          total_target_pa: 3,
          min_at_bats: 3,
          min_plate_appearances: 3,
        }}
      />,
    );

    fireEvent.press(getByText("投手別"));
    await flushPendingRequests();

    expect(getByText("投手 C 3打席")).toBeTruthy();
    expect(pitcherCrossRequested).toBe(false);
  });

  it("球種別のサンプル指定時は、フィルタを渡されていても API を呼ばずにサンプルで球種を切り替えられる", async () => {
    let crossRequested = false;
    server.use(
      http.get(baseUrl("/api/v2/stats/pitch_course_pitch_types"), () => {
        crossRequested = true;
        return HttpResponse.json({
          rows: [],
          total_target_pa: 0,
          min_at_bats: 3,
        });
      }),
    );
    const data = buildData({
      13: {
        plate_appearances: 5,
        at_bats: 5,
        hits: 2,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByText, queryByText } = renderWithProviders(
      <PitchCourseCard
        data={data}
        crossFilters={{}}
        samplePitchTypeCross={{
          rows: [
            {
              id: 1,
              label: "ストレート",
              plate_appearances: 5,
              zones: buildData({
                13: {
                  plate_appearances: 5,
                  at_bats: 5,
                  hits: 4,
                  batting_average: 0.8,
                  is_reliable: true,
                },
              }).zones,
            },
            {
              id: 2,
              label: "スライダー",
              plate_appearances: 3,
              zones: buildData({
                19: {
                  plate_appearances: 3,
                  at_bats: 3,
                  hits: 0,
                  batting_average: 0,
                  is_reliable: true,
                },
              }).zones,
            },
          ],
          total_target_pa: 8,
          min_at_bats: 3,
        }}
      />,
    );

    fireEvent.press(getByText("球種別"));
    expect(getByText(".800")).toBeTruthy();

    fireEvent.press(getByText("スライダー (3)"));
    expect(getByText(".000")).toBeTruthy();
    expect(queryByText(".800")).toBeNull();

    await flushPendingRequests();
    expect(crossRequested).toBe(false);
  });

  it("指標を切り替えるとセルの値と分母が変わり、三振率では三振の内訳を出す", () => {
    const data = buildData({
      13: {
        plate_appearances: 6,
        at_bats: 5,
        hits: 2,
        total_bases: 5,
        strikeouts: 3,
        swinging_strikeouts: 1,
        looking_strikeouts: 1,
        batting_average: 0.4,
        is_reliable: true,
      },
    });
    const { getByRole, getByText, queryByText } = renderWithProviders(
      <PitchCourseCard data={data} />,
    );
    expect(getByText("指標")).toBeTruthy();
    expect(getByText("区切り")).toBeTruthy();
    expect(getByRole("button", { name: "打率", selected: true })).toBeTruthy();
    expect(getByText(".400")).toBeTruthy();

    fireEvent.press(getByRole("button", { name: "長打率" }));
    expect(getByText("1.000")).toBeTruthy();
    expect(getByText("5打数")).toBeTruthy();
    expect(queryByText(".400")).toBeNull();

    fireEvent.press(getByRole("button", { name: "三振率" }));
    expect(getByText("50%")).toBeTruthy();
    expect(getByText("6打席")).toBeTruthy();
    expect(getByText("三振 3（空振り 1・見逃し 1・未入力 1）")).toBeTruthy();
    expect(getByText("打席が5未満のコースは参考値です")).toBeTruthy();

    fireEvent.press(getByRole("button", { name: "打席分布" }));
    expect(getByText("6")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
    expect(queryByText("打数が3未満のコースは参考値です")).toBeNull();
    expect(queryByText("三振 3（空振り 1・見逃し 1・未入力 1）")).toBeNull();
  });

  it("3x3 では外周と内側の1列を合算した打率を表示する", () => {
    const data = buildData({
      1: { plate_appearances: 2, at_bats: 2, hits: 1, batting_average: 0.5 },
      2: { plate_appearances: 1, at_bats: 1, hits: 0, batting_average: 0 },
      7: { plate_appearances: 2, at_bats: 2, hits: 1, batting_average: 0.5 },
    });
    const { getByRole, getByText, getAllByText, queryByText } =
      renderWithProviders(<PitchCourseCard data={data} />);
    expect(getAllByText(".500")).toHaveLength(2);

    fireEvent.press(getByRole("button", { name: "3x3" }));
    expect(getByText(".400")).toBeTruthy();
    expect(getByText("5打数")).toBeTruthy();
    expect(queryByText(".500")).toBeNull();
  });

  it("高低・内外とゾーン内外では帯ごとの合算をタイルで表示する", () => {
    const data = buildData({
      7: { plate_appearances: 2, at_bats: 2, hits: 1, batting_average: 0.5 },
      13: { plate_appearances: 3, at_bats: 3, hits: 1, batting_average: 0.333 },
      25: { plate_appearances: 4, at_bats: 4, hits: 0, batting_average: 0 },
    });
    const { getByRole, getByText, getAllByText } = renderWithProviders(
      <PitchCourseCard data={data} />,
    );

    fireEvent.press(getByRole("button", { name: "高低・内外" }));
    expect(getByText("高め")).toBeTruthy();
    expect(getByText("低め")).toBeTruthy();
    expect(getByText("三塁側")).toBeTruthy();
    expect(getByText("一塁側")).toBeTruthy();
    expect(getAllByText(".500")).toHaveLength(2);
    expect(getAllByText(".000")).toHaveLength(2);
    expect(
      getByText(
        "高低と内外は別々の見方のため、同じ打席が両方に入ります（真ん中の帯は含みません）",
      ),
    ).toBeTruthy();

    fireEvent.press(getByRole("button", { name: "ゾーン内外" }));
    expect(getAllByText("ストライクゾーン")).toHaveLength(1);
    expect(getByText(".400")).toBeTruthy();
    expect(getByText(".000")).toBeTruthy();
  });

  it("選んだ指標と粒度はタブを切り替えても保持される", () => {
    const data = buildData({
      13: { plate_appearances: 5, at_bats: 5, hits: 2, total_bases: 2 },
    });
    const { getByRole, getByText } = renderWithProviders(
      <PitchCourseCard
        data={data}
        samplePitcherCross={{
          rows: [
            {
              id: 1,
              label: "投手 C",
              team_name: null,
              plate_appearances: 4,
              zones: buildData({
                1: {
                  plate_appearances: 2,
                  at_bats: 2,
                  hits: 1,
                  total_bases: 4,
                },
                7: {
                  plate_appearances: 2,
                  at_bats: 2,
                  hits: 1,
                  total_bases: 2,
                },
              }).zones,
            },
          ],
          total_target_pa: 4,
          min_at_bats: 3,
          min_plate_appearances: 3,
        }}
      />,
    );

    fireEvent.press(getByRole("button", { name: "長打率" }));
    fireEvent.press(getByRole("button", { name: "3x3" }));
    fireEvent.press(getByText("投手別"));

    expect(
      getByRole("button", { name: "長打率", selected: true }),
    ).toBeTruthy();
    expect(getByRole("button", { name: "3x3", selected: true })).toBeTruthy();
    expect(getByText("1.500")).toBeTruthy();
    expect(getByText("4打数")).toBeTruthy();
  });

  it("ストライク / ボールゾーンの集計は打率なら (打数-安打)、他の指標なら分母を添える", () => {
    const data = buildData(
      {
        13: { plate_appearances: 14, at_bats: 12, hits: 4, total_bases: 6 },
      },
      {
        strike_zone: {
          ...EMPTY_SUMMARY,
          plate_appearances: 14,
          at_bats: 12,
          hits: 4,
          total_bases: 6,
          batting_average: 0.333,
        },
      },
    );
    const { getByRole, getByText, getAllByText, queryByText } =
      renderWithProviders(<PitchCourseCard data={data} />);
    expect(getByText("(12-4)")).toBeTruthy();

    fireEvent.press(getByRole("button", { name: "長打率" }));
    expect(queryByText("(12-4)")).toBeNull();
    expect(getAllByText("12打数")).toHaveLength(2);
  });
});
