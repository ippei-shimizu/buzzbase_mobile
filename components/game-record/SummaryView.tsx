import { View, Text, ScrollView } from "react-native";
import { Button } from "@components/ui/Button";

interface Props {
  // 試合情報
  date: string;
  matchType: string;
  myTeamName: string;
  opponentTeamName: string;
  myTeamScore: number;
  opponentTeamScore: number;
  battingOrder: string;
  defensivePosition: string;
  memo: string;
  // 打撃
  plateAppearances: number;
  timesAtBat: number;
  hit: number;
  twoBaseHit: number;
  threeBaseHit: number;
  homeRun: number;
  totalBases: number;
  runsBattedIn: number;
  run: number;
  strikeOut: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacrificeHit: number;
  sacrificeFly: number;
  stealingBase: number;
  caughtStealing: number;
  battingError: number;
  // 投手（null = スキップ）
  hasPitching: boolean;
  win: number;
  loss: number;
  hold: number;
  saves: number;
  inningsPitchedWhole: number;
  inningsPitchedFraction: number;
  numberOfPitches: number;
  gotToTheDistance: boolean;
  runAllowed: number;
  earnedRun: number;
  hitsAllowed: number;
  homeRunsHit: number;
  strikeouts: number;
  pitchingBaseOnBalls: number;
  pitchingHitByPitch: number;
  onComplete: () => void;
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: "#424242",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#d08000",
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: "#A1A1AA", fontSize: 14 }}>{label}</Text>
      <Text style={{ color: "#F4F4F4", fontSize: 14 }}>{value}</Text>
    </View>
  );
}

const FRACTION_LABELS = ["0/3", "1/3", "2/3"];

export function SummaryView(props: Props) {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Card title="試合情報">
        <Row label="日付" value={props.date} />
        <Row label="試合種類" value={props.matchType} />
        <Row
          label="スコア"
          value={`${props.myTeamName} ${props.myTeamScore} - ${props.opponentTeamScore} ${props.opponentTeamName}`}
        />
        <Row label="打順" value={props.battingOrder} />
        <Row label="守備位置" value={props.defensivePosition} />
        {props.memo ? <Row label="メモ" value={props.memo} /> : null}
      </Card>

      <Card title="打撃成績">
        <Row label="打席" value={props.plateAppearances} />
        <Row label="打数" value={props.timesAtBat} />
        <Row label="安打" value={props.hit} />
        <Row label="二塁打" value={props.twoBaseHit} />
        <Row label="三塁打" value={props.threeBaseHit} />
        <Row label="本塁打" value={props.homeRun} />
        <Row label="塁打" value={props.totalBases} />
        <Row label="打点" value={props.runsBattedIn} />
        <Row label="得点" value={props.run} />
        <Row label="三振" value={props.strikeOut} />
        <Row label="四球" value={props.baseOnBalls} />
        <Row label="死球" value={props.hitByPitch} />
        <Row label="犠打" value={props.sacrificeHit} />
        <Row label="犠飛" value={props.sacrificeFly} />
        <Row label="盗塁" value={props.stealingBase} />
        <Row label="盗塁死" value={props.caughtStealing} />
        <Row label="失策" value={props.battingError} />
      </Card>

      {props.hasPitching && (
        <Card title="投手成績">
          <Row
            label="勝敗"
            value={props.win > 0 ? "勝" : props.loss > 0 ? "負" : "なし"}
          />
          <Row label="ホールド" value={props.hold} />
          <Row label="セーブ" value={props.saves} />
          <Row
            label="投球回"
            value={`${props.inningsPitchedWhole} ${FRACTION_LABELS[props.inningsPitchedFraction]}`}
          />
          <Row label="完投" value={props.gotToTheDistance ? "○" : "×"} />
          <Row label="投球数" value={props.numberOfPitches} />
          <Row label="失点" value={props.runAllowed} />
          <Row label="自責点" value={props.earnedRun} />
          <Row label="被安打" value={props.hitsAllowed} />
          <Row label="被本塁打" value={props.homeRunsHit} />
          <Row label="奪三振" value={props.strikeouts} />
          <Row label="与四球" value={props.pitchingBaseOnBalls} />
          <Row label="与死球" value={props.pitchingHitByPitch} />
        </Card>
      )}

      <Button
        title="完了"
        onPress={props.onComplete}
        style={{ marginBottom: 40 }}
      />
    </ScrollView>
  );
}
