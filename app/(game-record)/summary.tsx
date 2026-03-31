import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Share, View } from "react-native";
import { SummaryView } from "@components/game-record/SummaryView";
import { BottomTabBar } from "@components/ui/BottomTabBar";
import { useGameRecord } from "@hooks/useGameRecord";
import { useGameRecordStore } from "../../stores/gameRecordStore";

export default function SummaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetFlow } = useGameRecord();
  const store = useGameRecordStore();

  const handleShare = async () => {
    const lines: string[] = [];
    const formattedDate = store.date
      ? `${new Date(store.date).getMonth() + 1}/${new Date(store.date).getDate()}`
      : "";
    lines.push(
      `${formattedDate} ${store.matchType} vs ${store.opponentTeamName} ${store.myTeamScore}-${store.opponentTeamScore}`,
    );

    const filteredBoxes = store.battingBoxes.filter((box) => box.result !== 0);
    if (filteredBoxes.length > 0) {
      const hits = filteredBoxes.filter((box) => {
        const lastChar = box.text[box.text.length - 1];
        return ["安", "二", "三", "本"].includes(lastChar);
      }).length;
      const atBats = filteredBoxes.filter(
        (box) =>
          !box.text.includes("四球") &&
          !box.text.includes("死球") &&
          !box.text.includes("犠打") &&
          !box.text.includes("犠飛"),
      ).length;
      const parts = [`${atBats}打数${hits}安打`];
      if (store.runsBattedIn > 0) parts.push(`${store.runsBattedIn}打点`);
      if (store.run > 0) parts.push(`${store.run}得点`);
      lines.push(`打撃: ${parts.join(" ")}`);
    }

    if (store.inningsPitchedWhole > 0 || store.inningsPitchedFraction > 0) {
      const ip = store.inningsPitchedWhole + store.inningsPitchedFraction / 3;
      lines.push(
        `投球: ${Math.round(ip * 10) / 10}回 ${store.strikeouts}K 自責${store.earnedRun}`,
      );
    }

    lines.push("#BUZZBASE");

    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      // ユーザーがキャンセルした場合は無視
    }
  };

  const handleComplete = () => {
    resetFlow();
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["gameResults"] });
    queryClient.invalidateQueries({ queryKey: ["userGameResults"] });
    router.replace("/(tabs)/(game-results)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <SummaryView
        date={store.date}
        matchType={store.matchType}
        tournamentName={store.tournamentName}
        myTeamName={store.myTeamName}
        opponentTeamName={store.opponentTeamName}
        myTeamScore={store.myTeamScore}
        opponentTeamScore={store.opponentTeamScore}
        battingOrder={store.battingOrder}
        defensivePosition={store.defensivePosition}
        memo={store.memo}
        battingBoxes={store.battingBoxes}
        runsBattedIn={store.runsBattedIn}
        run={store.run}
        stealingBase={store.stealingBase}
        caughtStealing={store.caughtStealing}
        battingError={store.battingError}
        hasPitching={store.pitchingResultId !== null}
        win={store.win}
        loss={store.loss}
        hold={store.hold}
        saves={store.saves}
        inningsPitchedWhole={store.inningsPitchedWhole}
        inningsPitchedFraction={store.inningsPitchedFraction}
        numberOfPitches={store.numberOfPitches}
        runAllowed={store.runAllowed}
        earnedRun={store.earnedRun}
        hitsAllowed={store.hitsAllowed}
        homeRunsHit={store.homeRunsHit}
        strikeouts={store.strikeouts}
        pitchingBaseOnBalls={store.pitchingBaseOnBalls}
        pitchingHitByPitch={store.pitchingHitByPitch}
        onComplete={handleComplete}
        onShare={handleShare}
      />
      <BottomTabBar />
    </View>
  );
}
