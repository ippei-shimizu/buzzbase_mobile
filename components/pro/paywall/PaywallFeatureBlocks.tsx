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
    title: "打った方向ごとの打率がわかる",
    description:
      "13 方向すべての打率が球場図のヒートマップになります。引っ張りと流し、どちらで結果が出ているかを見て、次の打席の狙いを決められます。",
    Art: HitDirectionArt,
    triggers: ["hit_direction_average"],
  },
  {
    key: "pitch_course",
    title: "コース別の打率を 25 分割で見られる",
    description:
      "ストライクゾーンとボールゾーンを合わせた 25 コースの打率がわかります。球種とのクロス集計もできるので、狙い球を絞り込めます。",
    Art: PitchCourseArt,
    triggers: ["pitch_course_average"],
  },
  {
    key: "pitcher_faceoff",
    title: "対戦した投手ごとの成績が残る",
    description:
      "同じ投手との通算打率や OPS が積み上がります。チーム名・投げる手・球速帯まで残るので、次の対戦前に相手を思い出せます。",
    Art: PitcherFaceoffArt,
    triggers: ["pitcher_faceoff_average"],
  },
  {
    key: "pitch_type",
    title: "球種別の打率を比べられる",
    description:
      "ストレートと変化球で打率がどう変わるかがわかります。打席ごとに記録した決着球種から自動で集計するので、入力は増えません。",
    Art: PitchTypeArt,
    triggers: ["pitch_type_average"],
  },
  {
    key: "count_situation",
    title: "カウント別の打率がわかる",
    description:
      "初球・有利カウント・追い込みの 3 つに分けて打率が出ます。追い込まれてからどれだけ粘れているかが数字で見えます。",
    Art: CountSituationArt,
    triggers: ["count_situation_average"],
  },
  {
    key: "season_trend",
    title: "シーズンを跨いで比べられる",
    description:
      "無料では単年までのグラフに、複数シーズンを重ねて表示できるようになります。去年の自分と今年の自分を並べて、伸びを確かめられます。",
    Art: SeasonTrendArt,
    triggers: ["season_transition_graph"],
  },
  {
    key: "media",
    title: "動画と画像を無制限に残せる",
    description:
      "無料では月 3 件までのアップロードが無制限になります。フォームの動画を何本でも野球ノートに付けて、崩れたときに見返せます。",
    Art: MediaUploadArt,
    triggers: ["unlimited_media_uploads"],
  },
  {
    key: "correlation",
    title: "練習と成績のつながりが見える",
    description:
      "練習量やコンディションと打率の関係を自動で分析します。やってきた練習が結果に出ているのかを、感覚ではなく数字で確かめられます。",
    Art: CorrelationArt,
    triggers: ["correlation_insights"],
  },
  {
    key: "periodic_review",
    title: "週次・月次のレポートが届く",
    description:
      "1 週間と 1 ヶ月の練習量・成績の変化、課題ごとの取り組み、前週比までが自動でまとまります。振り返りの時間を取らなくても続きます。",
    Art: PeriodicReviewArt,
    triggers: ["advanced_periodic_review"],
  },
  {
    key: "goals",
    title: "目標をいくつでも立てられる",
    description:
      "無料では 2 件までの期間目標が無制限になり、シーズン目標・大会目標・自由な期間の目標も設定できます。球速や体重など手入力の指標も追えます。",
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
    title: "課題を同時にいくつでも持てる",
    description:
      "無料では取り組み中 2 件までの課題が無制限になります。練習記録や野球ノートに複数の課題を紐付けて、何をどれだけやったかを残せます。",
    Art: ImprovementThemeArt,
    triggers: ["unlimited_improvement_themes", "multi_improvement_theme_links"],
  },
  {
    key: "groups",
    title: "グループをいくつでも作れる",
    description:
      "無料では所属 1 件までのグループが無制限になります。チーム・学年・仲間内で分けて、それぞれのランキングで競えます。",
    Art: GroupArt,
    triggers: ["unlimited_groups"],
  },
  {
    key: "no_ads",
    title: "広告がすべて消える",
    description:
      "アプリ内の広告がすべて非表示になります。試合中のあわただしい入力でも、広告に邪魔されず記録に集中できます。",
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
      {blocks.map(({ key, title, description, Art }, index) => (
        <View
          key={key}
          style={[styles.block, index % 2 === 1 && styles.blockAlternate]}
          accessibilityLabel={title}
        >
          <Art height={BLOCK_ART_HEIGHT} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // 帯を画面端まで届かせるため、Paywall 本体の左右パディング（20）を一覧全体で打ち消す。
  list: {
    alignSelf: "stretch",
    marginHorizontal: -20,
    marginBottom: 24,
  },
  block: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },
  blockAlternate: {
    backgroundColor: "#262629",
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
