import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

interface StatDef {
  name: string;
  formula?: string;
  description: string;
}

const BATTING_STATS: StatDef[] = [
  {
    name: "打率",
    formula: "安打 ÷ 打数",
    description:
      "打者のヒットを打つ能力を示す基本的な指標です。安打数と打数から簡単に計算できます。",
  },
  {
    name: "出塁率",
    formula: "（安打数＋四球＋死球）÷（打数＋四球＋死球＋犠飛）",
    description:
      "打者がどれだけの確率で出塁するかを示します。安打・四球・死球から簡単に計算できます。",
  },
  {
    name: "長打率",
    formula: "塁打数 ÷ 打数",
    description:
      "打者が打席に立った際に平均してどれだけの塁打数を稼ぐかを示す指標です。塁打数と打数から簡単に計算できます。",
  },
  {
    name: "OPS",
    formula: "出塁率 + 長打率",
    description:
      "打者の全体的な攻撃力を示す指標です。出塁率と長打率から簡単に計算できます。",
  },
  {
    name: "ISO",
    formula: "（二塁打 + 三塁打×2 + 本塁打×3）÷ 打数",
    description:
      "長打力のみを測る指標で、打者がどれだけ二塁打以上を打つ能力があるかを示します。",
  },
  {
    name: "ISOD",
    formula: "出塁率 - 打率",
    description:
      "打者の選球眼を示す指標で、打者がどれだけ四球で出塁する能力があるかを示します。",
  },
  {
    name: "BB/K",
    formula: "四球 ÷ 三振",
    description:
      "打者の選球眼とコンタクト能力を測る指標です。この値が高いほど、打者は選球眼が良く、三振の少ない打者として評価されます。",
  },
];

const PITCHING_STATS: StatDef[] = [
  {
    name: "防御率",
    formula: "自責点×9 ÷ 投球回数",
    description:
      "その投手が9イニング（1試合）を投げたとしたら何点に抑えられるかを示す指標です。自責点と投球回から簡単に計算できます。",
  },
  {
    name: "勝利",
    description:
      "スターターが5イニング以上を投げ、チームがリードしている状態で交代し、その後チームが負けることなく勝つ場合、スタートした投手が勝利投手になります。リリーフ投手の場合、公式記録員が「最も効果的だった」と判断した投手が勝利投手となります。",
  },
  {
    name: "敗戦",
    description:
      "チームが負けたゲームで、相手チームが勝利に必要なリードを取った時の投手が敗戦投手になります。敗戦投手は、ゲーム中に相手チームにリードを許し、そのリードが最後まで逆転されない場合に記録されます。",
  },
  {
    name: "ホールド",
    description:
      "リリーフ投手がゲームに登板し、リードを守りながら敗戦投手にならず、セーブの機会も成立させない状態で交代する。登板時、リードが3点以内であるか、同点または逆転を許していない状態で、少なくとも1アウトを取るか、登板時に同点または勝ち越しの走者が出塁していない場合に限る。",
  },
  {
    name: "セーブ",
    description:
      "投手がリリーフとして登板し、勝利を保存しゲーム終了まで投げる。登板時、勝利チームがリードしており、そのリードが3点以内であるか、投手が少なくとも3イニングを投げるか、同点または勝ち越しの走者が塁に出ている状態で登板する。投手がリードを守り抜き、ゲームを勝利で締めくくる。",
  },
  {
    name: "完投",
    description:
      "投手がゲームの初めから終わりまで自分一人で投げ抜き、試合を完了すること。",
  },
  {
    name: "完封",
    description: "投手が完投し、相手チームに一点も与えずに試合を終えること。",
  },
  {
    name: "勝率",
    formula: "勝利数 ÷（勝利数 + 敗戦数）",
    description:
      "投手の勝ちゲームに対する貢献度を示す指標で、高いほど投手がチームの勝利に大きく貢献していることを意味します。",
  },
  {
    name: "投球回",
    description:
      "実際に投げたイニング数を示す指標です。1イニングは相手チームの3人の打者をアウトさせることに相当します。",
  },
  {
    name: "失点",
    description:
      "投手がマウンドにいる間に相手チームが得た得点の総数です。これには、ヒット、四球、野手のエラーなどによって生じたすべての得点が含まれます。",
  },
  {
    name: "自責点",
    description:
      "投手のミスや守備のサポート不足（例：野手のエラー）によらないで生じた得点のみを数えたものです。具体的には、エラーや野手選択による得点を除外し、投手の責任による得点のみを計算します。",
  },
  {
    name: "被安打",
    description: "投手が許したヒット（単打、二塁打、三塁打）の総数です。",
  },
  {
    name: "被本塁打",
    description:
      "投手が投じた球を打者が打ち、その結果として本塁打になった回数です。",
  },
  {
    name: "奪三振",
    description: "投手が三振によってアウトを取った回数です。",
  },
  {
    name: "与四球",
    description: "四球によって打者を一塁に進めた回数です。",
  },
  {
    name: "与死球",
    description:
      "投じた球が打者に当たり、その結果として打者が一塁に進むことが許された回数です。",
  },
  {
    name: "K/9",
    formula: "（奪三振数×9）÷（投球回数）",
    description: "9イニングで三振をいくつ奪えるかを表した指標です。",
  },
  {
    name: "BB/9",
    formula: "（与四球÷投球回）×9",
    description: "9イニングあたりの与四球の数を示します。",
  },
  {
    name: "K/BB",
    formula: "奪三振 ÷ 与四球",
    description:
      "制球力と支配力のバランスを示す指標です。奪三振と与四球から簡単に計算できます。",
  },
  {
    name: "WHIP",
    formula: "（与四球 + 被安打） ÷ 投球回",
    description:
      "1イニングあたりに投手が許した走者（安打と四球の合計）の数を示します。",
  },
];

function StatCard({ stat }: { stat: StatDef }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statName}>{stat.name}</Text>
      {stat.formula && (
        <View style={styles.formulaContainer}>
          <Text style={styles.formulaLabel}>計算式</Text>
          <Text style={styles.formula}>{stat.formula}</Text>
        </View>
      )}
      <Text style={styles.statDescription}>{stat.description}</Text>
    </View>
  );
}

export default function CalculationOfGradesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.pageDescription}>
          打率・防御率・OPSなど、野球で使われる全29指標の計算式と意味を解説します。
        </Text>

        <Text style={styles.sectionTitle}>打撃成績</Text>
        {BATTING_STATS.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}

        <Text style={styles.sectionTitle}>投手成績</Text>
        {PITCHING_STATS.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  pageDescription: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  statCard: {
    backgroundColor: "#27272a",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  statName: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  formulaContainer: {
    backgroundColor: "#3A3A3A",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  formulaLabel: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  formula: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
  },
  statDescription: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 20,
  },
});
