import type { ArtProps } from "./artPrimitives";
import type { ProTrigger } from "@utils/analytics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CorrelationArt,
  GoalArt,
  GroupArt,
  ImprovementThemeArt,
  MediaUploadArt,
  PeriodicReviewArt,
} from "./PaywallFeatureArt";
import {
  CountSituationArt,
  HitDirectionArt,
  NoAdsArt,
  PitchCourseArt,
  PitcherFaceoffArt,
  PitchTypeArt,
  SeasonTrendArt,
} from "./PaywallSlideArt";

/** 一覧でのイラストの高さ。スライドより控えめにして、縦に読み進められるようにする。 */
const BLOCK_ART_HEIGHT = 168;

interface FeatureBlock {
  key: string;
  title: string;
  description: string;
  Art: (props: ArtProps) => React.JSX.Element;
  /** この機能から Paywall を開いたときに先頭へ出すためのトリガーキー。 */
  triggers: readonly ProTrigger[];
}

/**
 * 「Pro でできること」に並べる機能。
 * 上から「打席の記録がそのまま武器になる分析」→「続けるための機能」→「快適さ」の順で、
 * 打席データを持つ人が多い成績分析を先に見せる。
 */
const FEATURE_BLOCKS: readonly FeatureBlock[] = [
  {
    key: "hit_direction",
    title: "どこへ打つと結果が出るか",
    description:
      "打球の方向ごとの打率を球場図のヒートマップにします。引っ張りと流し、どちらで結果が出ているかが一目でわかります。",
    Art: HitDirectionArt,
    triggers: ["hit_direction_average"],
  },
  {
    key: "pitch_course",
    title: "得意なコース、苦手なコース",
    description:
      "ストライクゾーンを 9 分割して打率を色分けします。狙い球を絞るコースと、見送るべきコースがはっきりします。",
    Art: PitchCourseArt,
    triggers: ["pitch_course_average"],
  },
  {
    key: "pitcher_faceoff",
    title: "あの投手との通算成績",
    description:
      "対戦した投手ごとに成績が積み上がります。次に同じ相手と当たるとき、過去の結果を見てから打席に入れます。",
    Art: PitcherFaceoffArt,
    triggers: ["pitcher_faceoff_average"],
  },
  {
    key: "pitch_type",
    title: "変化球に強いか、弱いか",
    description:
      "ストレートと変化球で打率がどう変わるかを球種ごとに比べられます。苦手な球種が、そのまま練習のテーマになります。",
    Art: PitchTypeArt,
    triggers: ["pitch_type_average"],
  },
  {
    key: "count_situation",
    title: "追い込まれてからの一本",
    description:
      "初球・有利カウント・追い込みで打率がどう変わるかがわかります。カウントごとの戦い方を組み立てられます。",
    Art: CountSituationArt,
    triggers: ["count_situation_average"],
  },
  {
    key: "season_trend",
    title: "去年の自分と比べる",
    description:
      "シーズンを跨いで成績を重ねられます。1 年でどれだけ伸びたのかを、数字で確かめられます。",
    Art: SeasonTrendArt,
    triggers: ["season_transition_graph"],
  },
  {
    key: "media",
    title: "フォームを動画で残す",
    description:
      "野球ノートに動画と画像を無制限に付けられます。調子が良かった日のフォームを残して、崩れたときに見返せます。",
    Art: MediaUploadArt,
    triggers: ["unlimited_media_uploads"],
  },
  {
    key: "correlation",
    title: "練習は結果につながっているか",
    description:
      "練習量やコンディションと成績の関係を読み解きます。やってきたことが数字に出ているかを確かめられます。",
    Art: CorrelationArt,
    triggers: ["correlation_insights"],
  },
  {
    key: "periodic_review",
    title: "週末に届く、今週のまとめ",
    description:
      "1 週間・1 ヶ月の練習量と成績の変化が自動でまとまります。振り返りの時間を取らなくても続けられます。",
    Art: PeriodicReviewArt,
    triggers: ["advanced_periodic_review"],
  },
  {
    key: "goals",
    title: "目標までの距離が見える",
    description:
      "シーズン目標・大会目標を立てて、達成度を自動で追えます。期間を自分で決めた目標や、球速など手入力の指標も設定できます。",
    Art: GoalArt,
    triggers: [
      "season_goals",
      "tournament_goals",
      "custom_period_goals",
      "manual_metric_goals",
      "unlimited_monthly_goals",
    ],
  },
  {
    key: "improvement_themes",
    title: "課題を並行して潰していく",
    description:
      "取り組む課題をいくつでも持てます。練習記録やノートを課題に紐付けて、何をどれだけやったかを残せます。",
    Art: ImprovementThemeArt,
    triggers: ["unlimited_improvement_themes", "multi_improvement_theme_links"],
  },
  {
    key: "groups",
    title: "チームや仲間と競い合う",
    description:
      "グループをいくつでも作れて、参加もできます。学年やチームを分けて、それぞれのランキングで競えます。",
    Art: GroupArt,
    triggers: ["unlimited_groups"],
  },
  {
    key: "no_ads",
    title: "広告に邪魔されない",
    description:
      "アプリ内の広告がすべて消えます。試合中のあわただしい入力でも、手が止まりません。",
    Art: NoAdsArt,
    triggers: ["no_ads"],
  },
];

/**
 * トリガーになった機能を先頭にした並び順を返す。
 * @param trigger Paywall を開いた起点の機能キー
 */
export function orderFeatureBlocks(trigger: ProTrigger): FeatureBlock[] {
  const lead = FEATURE_BLOCKS.find((block) => block.triggers.includes(trigger));
  if (!lead) return [...FEATURE_BLOCKS];
  return [lead, ...FEATURE_BLOCKS.filter((block) => block.key !== lead.key)];
}

interface PaywallFeatureBlocksProps {
  trigger: ProTrigger;
}

/**
 * 「Pro でできること」の一覧。機能ごとにイラスト・見出し・説明を縦に並べる。
 * 図はすべて作り物で、ユーザー本人の成績は描かない。
 */
export function PaywallFeatureBlocks({ trigger }: PaywallFeatureBlocksProps) {
  const blocks = orderFeatureBlocks(trigger);
  return (
    <View style={styles.list}>
      {blocks.map(({ key, title, description, Art }) => (
        <View key={key} style={styles.block} accessibilityLabel={title}>
          <Art height={BLOCK_ART_HEIGHT} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    gap: 28,
    marginBottom: 24,
  },
  block: {
    width: "100%",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 12,
  },
  description: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 6,
  },
});
