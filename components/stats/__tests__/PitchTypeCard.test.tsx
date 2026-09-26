/**
 * 球種別の打率カードの展開の振る舞いテスト。
 *
 * 検証対象:
 * - 複数の球種の行を同時に展開できる
 * - 展開済みの行を再度押すとその行だけ閉じる
 * - rows が差し替わっても展開状態を持ち越す
 * - 行の読み上げラベルに打率と打数・安打を含め、開閉記号は含めない
 */
import type { PitchTypeRow } from "../../../types/stats";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { PitchTypeCard } from "../PitchTypeCard";

const buildRow = (id: number, label: string): PitchTypeRow => ({
  id,
  label,
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
  result_counts: [],
});

const buildCard = (rows: PitchTypeRow[]) => (
  <PitchTypeCard rows={rows} totalTargetPa={20} />
);

const renderCard = (
  rows: PitchTypeRow[] = [buildRow(1, "ストレート"), buildRow(2, "カーブ")],
) => render(buildCard(rows));

const rowOf = (label: string) =>
  screen.getByRole("button", { name: new RegExp(label) });

const pressRow = (label: string) => {
  fireEvent.press(rowOf(label));
};

describe("PitchTypeCard", () => {
  it("複数の球種の行を同時に展開できる", () => {
    renderCard();

    pressRow("ストレート");
    pressRow("カーブ");

    expect(rowOf("ストレート")).toBeExpanded();
    expect(rowOf("カーブ")).toBeExpanded();
    expect(screen.getAllByText("出塁率")).toHaveLength(2);
  });

  it("展開済みの行を再度押すとその行だけ閉じる", () => {
    renderCard();

    pressRow("ストレート");
    pressRow("カーブ");
    pressRow("ストレート");

    expect(rowOf("ストレート")).toBeCollapsed();
    expect(rowOf("カーブ")).toBeExpanded();
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });

  // rows の差し替えは pull to refresh や refetch でも起きるため、展開状態は意図的に持ち越す。
  it("rows が差し替わっても展開済みの行の状態を保つ", () => {
    const { rerender } = renderCard();

    pressRow("ストレート");
    pressRow("カーブ");
    rerender(buildCard([buildRow(1, "ストレート"), buildRow(3, "スライダー")]));

    expect(rowOf("ストレート")).toBeExpanded();
    expect(rowOf("スライダー")).toBeCollapsed();
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });

  it("行の読み上げラベルに打率と打数・安打を含め、開閉記号は含めない", () => {
    renderCard();

    expect(
      screen.getByLabelText("ストレート、打率.333、9打数3安打"),
    ).toBeOnTheScreen();
  });
});
