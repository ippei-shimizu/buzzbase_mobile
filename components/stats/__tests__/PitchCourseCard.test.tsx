/**
 * コース別の打率カードの振る舞いテスト。
 *
 * 検証対象:
 * - 打数 0 のセルは "-" 表示（色スケールの対象外）
 * - 打数が min_at_bats 未満のセルは打率に (N打数) の参考値表記が付く
 * - total_target_pa が 0 のときはヒートマップを出さず空状態を表示する
 * - 「球種別」タブを開いたときにだけクロス集計 API を取得する
 * - 「投手別」タブを開いたときにだけ投手×コース API を取得し、投手を切り替えられる
 */
import type { PitchCourseData, PitchCourseZone } from "../../../types/stats";
import { fireEvent } from "@testing-library/react-native";
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
  batting_average: 0,
  is_reliable: false,
  ...overrides,
});

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
    strike_zone: {
      plate_appearances: 0,
      at_bats: 0,
      hits: 0,
      batting_average: 0,
    },
    ball_zone: {
      plate_appearances: 0,
      at_bats: 0,
      hits: 0,
      batting_average: 0,
    },
    total_target_pa: totalPa,
    min_at_bats: 3,
    ...overrides,
  };
};

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
    // 25 マス中 24 マスが打数 0
    expect(getAllByText("-")).toHaveLength(24);
    expect(getByText(".400")).toBeTruthy();
  });

  it("打数が 3 未満のセルは (N打数) の参考値表記が付く", () => {
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
    expect(getByText("(2打数)")).toBeTruthy();
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
    const { getByText, findByText, queryByText } = renderWithProviders(
      <PitchCourseCard data={data} crossFilters={{}} />,
    );

    expect(pitcherCrossRequested).toBe(false);
    fireEvent.press(getByText("投手別"));
    expect(await findByText("エース投手 (5)")).toBeTruthy();
    expect(pitcherCrossRequested).toBe(true);
    expect(getByText("相手高校")).toBeTruthy();
    expect(getByText(".800")).toBeTruthy();

    fireEvent.press(getByText("控え投手 (3)"));
    expect(getByText(".000")).toBeTruthy();
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
    expect(getByText("投手 C (3)")).toBeTruthy();
  });
});
