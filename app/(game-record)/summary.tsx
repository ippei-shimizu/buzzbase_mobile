import { View } from "react-native";
import { useRouter } from "expo-router";
import { useGameRecord } from "@hooks/useGameRecord";
import { useGameRecordStore } from "../../stores/gameRecordStore";
import { SummaryView } from "@components/game-record/SummaryView";

export default function SummaryScreen() {
  const router = useRouter();
  const { resetFlow } = useGameRecord();
  const store = useGameRecordStore();

  const handleComplete = () => {
    resetFlow();
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <SummaryView
        date={store.date}
        matchType={store.matchType}
        myTeamName={store.myTeamName}
        opponentTeamName={store.opponentTeamName}
        myTeamScore={store.myTeamScore}
        opponentTeamScore={store.opponentTeamScore}
        battingOrder={store.battingOrder}
        defensivePosition={store.defensivePosition}
        memo={store.memo}
        plateAppearances={store.plateAppearances}
        timesAtBat={store.timesAtBat}
        hit={store.hit}
        twoBaseHit={store.twoBaseHit}
        threeBaseHit={store.threeBaseHit}
        homeRun={store.homeRun}
        totalBases={store.totalBases}
        runsBattedIn={store.runsBattedIn}
        run={store.run}
        strikeOut={store.strikeOut}
        baseOnBalls={store.baseOnBalls}
        hitByPitch={store.hitByPitch}
        sacrificeHit={store.sacrificeHit}
        sacrificeFly={store.sacrificeFly}
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
        gotToTheDistance={store.gotToTheDistance}
        runAllowed={store.runAllowed}
        earnedRun={store.earnedRun}
        hitsAllowed={store.hitsAllowed}
        homeRunsHit={store.homeRunsHit}
        strikeouts={store.strikeouts}
        pitchingBaseOnBalls={store.pitchingBaseOnBalls}
        pitchingHitByPitch={store.pitchingHitByPitch}
        onComplete={handleComplete}
      />
    </View>
  );
}
