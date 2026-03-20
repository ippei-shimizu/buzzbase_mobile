import { View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useGameRecord } from "@hooks/useGameRecord";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { SummaryView } from "@components/game-record/SummaryView";
import { BottomTabBar } from "@components/ui/BottomTabBar";

export default function SummaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetFlow } = useGameRecord();
  const store = useGameRecordStore();

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
      />
      <BottomTabBar />
    </View>
  );
}
