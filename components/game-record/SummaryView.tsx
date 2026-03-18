import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import type { BattingBox } from "../../types/gameRecord";

interface Props {
  // 試合情報
  date: string;
  matchType: string;
  tournamentName: string;
  myTeamName: string;
  opponentTeamName: string;
  myTeamScore: number;
  opponentTeamScore: number;
  battingOrder: string;
  defensivePosition: string;
  memo: string;
  // 打撃
  battingBoxes: BattingBox[];
  runsBattedIn: number;
  run: number;
  stealingBase: number;
  caughtStealing: number;
  battingError: number;
  // 投手
  hasPitching: boolean;
  win: number;
  loss: number;
  hold: number;
  saves: number;
  inningsPitchedWhole: number;
  inningsPitchedFraction: number;
  numberOfPitches: number;
  runAllowed: number;
  earnedRun: number;
  hitsAllowed: number;
  homeRunsHit: number;
  strikeouts: number;
  pitchingBaseOnBalls: number;
  pitchingHitByPitch: number;
  onComplete: () => void;
}

const MATCH_TYPE_LABELS: Record<string, string> = {
  regular: "公式戦",
  open: "オープン戦",
  練習試合: "練習試合",
};

const BATTING_ORDER_LABELS: Record<string, string> = {
  "1": "1番",
  "2": "2番",
  "3": "3番",
  "4": "4番",
  "5": "5番",
  "6": "6番",
  "7": "7番",
  "8": "8番",
  "9": "9番",
};

const FRACTION_LABELS = ["", "1/3", "2/3"];

const HITS = new Set(["安", "二", "三", "本"]);

function isHitResult(text: string): boolean {
  if (text.length < 2) return false;
  const lastChar = text[text.length - 1];
  return HITS.has(lastChar);
}

function isWalkResult(text: string): boolean {
  return (
    text.includes("四球") ||
    text.includes("死球") ||
    text.includes("犠打") ||
    text.includes("犠飛") ||
    text.includes("打妨")
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "33%",
        marginBottom: 4,
      }}
    >
      <Text style={{ fontSize: 13, color: "#A1A1AA", marginRight: 4 }}>
        {label}:
      </Text>
      <Text style={{ fontSize: 15, fontWeight: "bold", color: "#F4F4F4" }}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: "#52525B", marginVertical: 16 }}
    />
  );
}

export function SummaryView(props: Props) {
  const formattedDate = props.date
    ? new Date(props.date).toLocaleDateString("ja-JP")
    : "";

  const matchTypeLabel = MATCH_TYPE_LABELS[props.matchType] ?? props.matchType;

  const scoreIcon =
    props.myTeamScore > props.opponentTeamScore
      ? { text: "◯", color: "#EF4444" }
      : props.myTeamScore < props.opponentTeamScore
        ? { text: "×", color: "#3B82F6" }
        : { text: "ー", color: "#F4F4F4" };

  const fractionStr = FRACTION_LABELS[props.inningsPitchedFraction] ?? "";
  const inningsDisplay = `${props.inningsPitchedWhole}回${fractionStr}`;

  // 打席結果のテキストを取得（有効なもののみ）
  const plateResults = props.battingBoxes.filter(
    (box) => box.position !== 0 || box.result !== 0,
  );

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* タイトル */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#F4F4F4",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        試合結果まとめ
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#A1A1AA",
          textAlign: "center",
          marginTop: 16,
        }}
      >
        成績を友達にシェアしよう！
      </Text>

      {/* シェアボタン */}
      <View style={{ alignItems: "center", marginTop: 12 }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: "#d08000",
            borderRadius: 8,
            paddingHorizontal: 24,
            paddingVertical: 10,
            backgroundColor: "#d08000",
          }}
        >
          <Text style={{ color: "#F4F4F4", fontSize: 15, fontWeight: "bold" }}>
            成績をシェア
          </Text>
        </TouchableOpacity>
      </View>

      {/* メインカード */}
      <View
        style={{
          backgroundColor: "#3a3a3a",
          borderRadius: 12,
          padding: 16,
          marginTop: 20,
        }}
      >
        {/* 試合情報 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#52525B",
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 12, color: "#d08000" }}>
              {matchTypeLabel}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: "#F4F4F4" }}>
            {formattedDate}
          </Text>
        </View>

        {props.tournamentName ? (
          <Text style={{ fontSize: 13, color: "#F4F4F4", marginTop: 8 }}>
            {props.tournamentName}
          </Text>
        ) : null}

        <Text style={{ fontSize: 12, color: "#A1A1AA", marginTop: 10 }}>
          マイチーム
        </Text>
        <Text style={{ fontSize: 15, color: "#F4F4F4", marginTop: 2 }}>
          {props.myTeamName}
        </Text>

        {/* スコア */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            gap: 12,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
          >
            <Text style={{ fontSize: 16, color: scoreIcon.color }}>
              {scoreIcon.text}
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#F4F4F4" }}
            >
              {props.myTeamScore} - {props.opponentTeamScore}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}
          >
            <Text style={{ fontSize: 14, color: "#A1A1AA" }}>vs.</Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#F4F4F4" }}
            >
              {props.opponentTeamName}
            </Text>
          </View>
        </View>

        {/* 打順・守備位置 */}
        <View style={{ flexDirection: "row", marginTop: 6, gap: 12 }}>
          <Text style={{ fontSize: 13, color: "#A1A1AA" }}>
            {BATTING_ORDER_LABELS[props.battingOrder] ?? props.battingOrder}
          </Text>
          <Text style={{ fontSize: 13, color: "#A1A1AA" }}>
            {props.defensivePosition}
          </Text>
        </View>

        <Divider />

        {/* 打撃セクション */}
        <Text style={{ fontSize: 12, color: "#A1A1AA" }}>打撃</Text>

        {plateResults.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
            }}
          >
            {plateResults.map((box, index) => {
              const text = box.text.replace("-", "");
              const color = isHitResult(text)
                ? "#EF4444"
                : isWalkResult(text)
                  ? "#60A5FA"
                  : "#F4F4F4";
              return (
                <Text
                  key={index}
                  style={{ fontWeight: "bold", color, fontSize: 14 }}
                >
                  {text}
                </Text>
              );
            })}
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <StatItem label="打点" value={props.runsBattedIn} />
          <StatItem label="得点" value={props.run} />
          <StatItem label="失策" value={props.battingError} />
          <StatItem label="盗塁" value={props.stealingBase} />
          <StatItem label="盗塁死" value={props.caughtStealing} />
        </View>

        <Divider />

        {/* 投手セクション */}
        <Text style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 8 }}>
          投手
        </Text>

        {props.hasPitching ? (
          <>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {props.win > 0 ? (
                <Text
                  style={{
                    color: "#EF4444",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  勝利投手
                </Text>
              ) : props.loss > 0 ? (
                <Text
                  style={{
                    color: "#3B82F6",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  敗戦投手
                </Text>
              ) : null}
              <Text style={{ fontSize: 15, color: "#F4F4F4" }}>
                {inningsDisplay}
              </Text>
              <Text style={{ fontSize: 15, color: "#F4F4F4" }}>
                {props.numberOfPitches}球
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              <StatItem label="ホールド" value={props.hold} />
              <StatItem label="セーブ" value={props.saves} />
              <StatItem label="失点" value={props.runAllowed} />
              <StatItem label="自責点" value={props.earnedRun} />
              <StatItem label="被安打" value={props.hitsAllowed} />
              <StatItem label="被本塁打" value={props.homeRunsHit} />
              <StatItem label="奪三振" value={props.strikeouts} />
              <StatItem label="四球" value={props.pitchingBaseOnBalls} />
              <StatItem label="死球" value={props.pitchingHitByPitch} />
            </View>
          </>
        ) : (
          <Text style={{ fontSize: 13, color: "#71717A" }}>
            投手成績はありません。
          </Text>
        )}
      </View>

      {/* MEMO */}
      {props.memo ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 13, color: "#71717A", marginBottom: 8 }}>
            MEMO
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#52525B",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 14, color: "#D4D4D8" }}>{props.memo}</Text>
          </View>
        </View>
      ) : null}

      {/* マイページへ */}
      <TouchableOpacity
        onPress={props.onComplete}
        style={{ alignSelf: "flex-end", marginTop: 24, marginBottom: 40 }}
      >
        <Text
          style={{
            color: "#d08000",
            fontSize: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#d08000",
          }}
        >
          試合一覧へ
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
