/**
 * 対戦投手別リストの展開の振る舞いテスト。
 *
 * 検証対象:
 * - 複数の投手の行を同時に展開できる
 * - 展開済みの行を再度押すとその行だけ閉じる
 */
import type { PitcherFaceoff } from "../../../types/stats";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { PitcherFaceoffList } from "../PitcherFaceoffList";

const buildRow = (pitcherId: number, pitcherName: string): PitcherFaceoff => ({
  pitcher_id: pitcherId,
  pitcher_name: pitcherName,
  team_name: null,
  throw_hand: null,
  pitcher_style: null,
  velocity_zone: null,
  plate_appearances: 10,
  at_bats: 9,
  hits: 3,
  total_bases: 4,
  base_on_balls: 1,
  hit_by_pitch: 0,
  sacrifice_fly: 0,
  batting_average: 0.333,
  on_base_percentage: 0.4,
  slugging_percentage: 0.444,
  ops: 0.844,
  top_result: "ヒット",
  result_counts: [],
});

const renderList = () =>
  render(
    <PitcherFaceoffList
      rows={[buildRow(1, "投手A"), buildRow(2, "投手B")]}
      minPlateAppearances={3}
      totalTargetPa={20}
    />,
  );

const pressRow = (pitcherName: string) => {
  fireEvent.press(screen.getByText(new RegExp(`${pitcherName}$`)));
};

describe("PitcherFaceoffList", () => {
  it("複数の投手の行を同時に展開できる", () => {
    renderList();

    pressRow("投手A");
    pressRow("投手B");

    expect(screen.getByText("▼ 投手A")).toBeTruthy();
    expect(screen.getByText("▼ 投手B")).toBeTruthy();
  });

  it("展開済みの行を再度押すとその行だけ閉じる", () => {
    renderList();

    pressRow("投手A");
    pressRow("投手B");
    pressRow("投手A");

    expect(screen.getByText("▶ 投手A")).toBeTruthy();
    expect(screen.getByText("▼ 投手B")).toBeTruthy();
  });
});
