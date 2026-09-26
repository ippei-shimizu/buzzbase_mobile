/**
 * 対戦投手別リストの展開の振る舞いテスト。
 *
 * 検証対象:
 * - 複数の投手の行を同時に展開できる
 * - 展開済みの行を再度押すとその行だけ閉じる
 * - rows が差し替わっても展開状態を持ち越す
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

const buildList = (rows: PitcherFaceoff[]) => (
  <PitcherFaceoffList rows={rows} minPlateAppearances={3} totalTargetPa={20} />
);

const renderList = (
  rows: PitcherFaceoff[] = [buildRow(1, "投手A"), buildRow(2, "投手B")],
) => render(buildList(rows));

const rowOf = (pitcherName: string) =>
  screen.getByRole("button", { name: new RegExp(pitcherName) });

const pressRow = (pitcherName: string) => {
  fireEvent.press(rowOf(pitcherName));
};

const isExpanded = (pitcherName: string) =>
  rowOf(pitcherName).props.accessibilityState?.expanded === true;

describe("PitcherFaceoffList", () => {
  it("複数の投手の行を同時に展開できる", () => {
    renderList();

    pressRow("投手A");
    pressRow("投手B");

    expect(isExpanded("投手A")).toBe(true);
    expect(isExpanded("投手B")).toBe(true);
    expect(screen.getAllByText("出塁率")).toHaveLength(2);
  });

  it("展開済みの行を再度押すとその行だけ閉じる", () => {
    renderList();

    pressRow("投手A");
    pressRow("投手B");
    pressRow("投手A");

    expect(isExpanded("投手A")).toBe(false);
    expect(isExpanded("投手B")).toBe(true);
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });

  // rows の差し替えは pull to refresh や refetch でも起きるため、展開状態は意図的に持ち越す。
  it("rows が差し替わっても展開済みの行の状態を保つ", () => {
    const { rerender } = renderList();

    pressRow("投手A");
    rerender(buildList([buildRow(1, "投手A"), buildRow(3, "投手C")]));

    expect(isExpanded("投手A")).toBe(true);
    expect(isExpanded("投手C")).toBe(false);
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });
});
