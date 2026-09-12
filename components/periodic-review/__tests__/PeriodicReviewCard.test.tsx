/**
 * 振り返りレポートカードの表示テスト。
 * 指標を追加する前に生成された古いレポートは summary のキー自体を持たないため、
 * 「新指標が揃ったレポート」と「欠損したレポート」の両方を検証する。
 */
import type { PeriodicReview } from "../../../types/periodicReview";
import { render, screen } from "@testing-library/react-native";
import { PeriodicReviewCard } from "../PeriodicReviewCard";

const fullReview: PeriodicReview = {
  id: 1,
  period_type: "weekly",
  period_start: "2026-07-13",
  period_end: "2026-07-19",
  read: true,
  summary: {
    period_type: "weekly",
    practice_days: 5,
    total_swings: 1200,
    active_days: 5,
    streak_current: 12,
    batting: {
      batting_average: 0.312,
      on_base_percentage: 0.388,
      slugging_percentage: 0.451,
      ops: 0.839,
      previous_batting_average: 0.286,
      delta: 0.026,
      hits: 5,
      two_base_hits: 2,
      three_base_hits: 0,
      home_runs: 1,
      stolen_bases: 4,
      strikeouts: 3,
      scoring_position: { batting_average: 0.4, at_bats: 5, hits: 2 },
    },
    pitching: {
      appearances: 1,
      innings_pitched: 7,
      era: 2.57,
      whip: 1.14,
      k_per_9: 9,
      strikeouts: 8,
      base_on_balls: 2,
      hit_by_pitch: 1,
      hits_allowed: 6,
      home_runs_allowed: 0,
      runs_allowed: 3,
      earned_runs: 2,
    },
    condition: {
      sleep_hours_avg: 7.2,
      fatigue_level_avg: 2.4,
      physical_level_avg: 3.6,
    },
    practice_menus: {
      items: [
        {
          name: "ティーバッティング",
          count: 3,
          total_amount: 150,
          unit_label: "本",
        },
      ],
      other_count: 2,
    },
    note_days: 4,
    goals: [
      {
        id: 1,
        title: "今月2000本素振り",
        kind: "numeric",
        metric_key: "total_swing_count",
        custom_metric_label: null,
        current_value: 1450,
        target_value: 2000,
        progress_percent: 72.5,
        achieved: false,
        deadline: "2026-07-31",
      },
    ],
    insight: {
      key: "swings_batting_average",
      id: null,
      title: "素振りと打率の関係",
      body: "素振りが多い週は打率が高い傾向があります。",
      metric: "batting_average",
      dimension: "total_swings",
      direction: "positive",
      strength: "strong",
      sample_weeks: 8,
      sufficient: true,
    },
  },
};

describe("PeriodicReviewCard", () => {
  it("新指標が揃ったレポートは各セクションの値を表示する", () => {
    render(<PeriodicReviewCard review={fullReview} />);

    expect(screen.getByText("7月 第2週の振り返り")).toBeOnTheScreen();
    expect(screen.getByText(".312")).toBeOnTheScreen();
    expect(screen.getByText(".400")).toBeOnTheScreen();
    expect(screen.getByText("+.026")).toBeOnTheScreen();
    expect(screen.getByText("7.0")).toBeOnTheScreen();
    expect(screen.getByText("ティーバッティング")).toBeOnTheScreen();
    expect(screen.getByText("他 2 件のメニュー")).toBeOnTheScreen();
    expect(screen.getByText("記録した日数 4日")).toBeOnTheScreen();
    expect(screen.getByText("今月2000本素振り")).toBeOnTheScreen();
    expect(screen.getByText("素振りと打率の関係")).toBeOnTheScreen();
  });

  it("新指標を持たない古いレポートは欠損を - で表示し、無いセクションを出さない", () => {
    render(
      <PeriodicReviewCard
        review={{
          ...fullReview,
          summary: {
            period_type: "weekly",
            practice_days: 3,
            total_swings: 400,
            active_days: 3,
            streak_current: 2,
            batting: { batting_average: 0.25 },
          },
        }}
      />,
    );

    expect(screen.getByText(".250")).toBeOnTheScreen();
    // 出塁率・長打率・OPS・得点圏打率がすべて欠損している。
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText("投手")).not.toBeOnTheScreen();
    expect(screen.queryByText("練習メニュー別")).not.toBeOnTheScreen();
    expect(screen.queryByText("コンディション")).not.toBeOnTheScreen();
    expect(screen.queryByText("野球ノート")).not.toBeOnTheScreen();
    expect(screen.queryByText("目標の進捗")).not.toBeOnTheScreen();
    expect(screen.queryByText("インサイト")).not.toBeOnTheScreen();
  });
});
