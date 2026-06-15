import type { BattingBox } from "../../types/gameRecord";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Share, View } from "react-native";
import { SummaryView } from "@components/game-record/SummaryView";
import { PreReviewPrompt } from "@components/store-review/PreReviewPrompt";
import { BottomTabBar } from "@components/ui/BottomTabBar";
import { useGameRecord } from "@hooks/useGameRecord";
import { usePlateAppearancesByGame } from "@hooks/usePlateAppearances";
import { useStoreReview } from "@hooks/useStoreReview";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";
import { useGameRecordStore } from "../../stores/gameRecordStore";

type PrePromptSource = "complete" | "share";

export default function SummaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetFlow } = useGameRecord();
  const store = useGameRecordStore();
  const { incrementPositiveEvent, checkAndShowPrePrompt, requestNativeReview } =
    useStoreReview();
  const [prePromptVisible, setPrePromptVisible] = useState(false);
  const sourceRef = useRef<PrePromptSource>("complete");

  // v2 で記録された打席は plate_appearances API から取得する。
  // v1 経路（store.battingBoxes が埋まる）はサーバから取れない場合のフォールバック。
  const { plateAppearances } = usePlateAppearancesByGame(store.gameResultId);

  const battingBoxes: BattingBox[] = useMemo(() => {
    if (plateAppearances.length > 0) {
      return plateAppearances
        .slice()
        .sort((a, b) => a.batter_box_number - b.batter_box_number)
        .map((pa) => ({
          id: pa.id,
          position: pa.hit_direction_id ?? 0,
          result: pa.plate_result_id ?? 0,
          text: pa.batting_result || "",
        }));
    }
    return store.battingBoxes;
  }, [plateAppearances, store.battingBoxes]);

  // v2 経路では打点 / 得点 / 盗塁 / 盗塁死は plate_appearances 単位で保存される。
  // SummaryView は試合合計値で表示するため、ここで集計してから渡す。
  // plate_appearances が空（= v1 経路）のときは従来通り store の試合合計値を使う。
  const isV2 = plateAppearances.length > 0;
  const aggregate = (
    selector: (pa: (typeof plateAppearances)[number]) => number | null,
  ) => plateAppearances.reduce((sum, pa) => sum + (selector(pa) ?? 0), 0);
  const summaryRunsBattedIn = isV2
    ? aggregate((pa) => pa.rbi)
    : store.runsBattedIn;
  const summaryRun = isV2 ? aggregate((pa) => pa.run_scored) : store.run;
  const summaryStealingBase = isV2
    ? aggregate((pa) => pa.stolen_bases)
    : store.stealingBase;
  const summaryCaughtStealing = isV2
    ? aggregate((pa) => pa.caught_stealing)
    : store.caughtStealing;

  const tryShowPrePrompt = async (source: PrePromptSource) => {
    try {
      await incrementPositiveEvent();
      const shouldShow = await checkAndShowPrePrompt();
      if (shouldShow) {
        sourceRef.current = source;
        setPrePromptVisible(true);
        return true;
      }
    } catch {
      // 失敗時は静かに無視する
    }
    return false;
  };

  const handleShare = async () => {
    const lines: string[] = [];
    const formattedDate = store.date
      ? `${new Date(store.date).getMonth() + 1}/${new Date(store.date).getDate()}`
      : "";
    // Step1 のバリデーションを通過しているため null にはならない想定だが、念のためフォールバック。
    const myScore = store.myTeamScore ?? 0;
    const opponentScore = store.opponentTeamScore ?? 0;
    lines.push(
      `${formattedDate} ${store.matchType} vs ${store.opponentTeamName} ${myScore}-${opponentScore}`,
    );

    const filteredBoxes = battingBoxes.filter((box) => box.result !== 0);
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
      if (summaryRunsBattedIn > 0) parts.push(`${summaryRunsBattedIn}打点`);
      if (summaryRun > 0) parts.push(`${summaryRun}得点`);
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
      const result = await Share.share({ message: lines.join("\n") });
      if (result.action === Share.sharedAction) {
        await tryShowPrePrompt("share");
      }
    } catch {
      // ユーザーがキャンセルした場合は無視
    }
  };

  const handleComplete = async () => {
    resetFlow();
    invalidateGameResultRelated(queryClient);

    const shown = await tryShowPrePrompt("complete");
    if (shown) return;
    router.replace({
      pathname: "/(tabs)/(game-results)",
      params: { tab: "list" },
    });
  };

  const handlePrePromptYes = async () => {
    const source = sourceRef.current;
    setPrePromptVisible(false);
    await requestNativeReview().catch(() => {});
    if (source === "complete") {
      router.replace({
        pathname: "/(tabs)/(game-results)",
        params: { tab: "list" },
      });
    }
  };

  const handlePrePromptNo = () => {
    const source = sourceRef.current;
    setPrePromptVisible(false);
    if (source === "complete") {
      router.replace({
        pathname: "/(tabs)/(profile)/contact",
        params: { subject: "feedback" },
      });
    } else {
      router.push({
        pathname: "/(tabs)/(profile)/contact",
        params: { subject: "feedback" },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <SummaryView
        date={store.date}
        matchType={store.matchType}
        appearanceType={store.appearanceType}
        tournamentName={store.tournamentName}
        myTeamName={store.myTeamName}
        opponentTeamName={store.opponentTeamName}
        myTeamScore={store.myTeamScore}
        opponentTeamScore={store.opponentTeamScore}
        battingOrder={store.battingOrder}
        defensivePosition={store.defensivePosition}
        memo={store.memo}
        battingBoxes={battingBoxes}
        plateAppearances={plateAppearances}
        runsBattedIn={summaryRunsBattedIn}
        run={summaryRun}
        stealingBase={summaryStealingBase}
        caughtStealing={summaryCaughtStealing}
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
      <PreReviewPrompt
        visible={prePromptVisible}
        onYes={handlePrePromptYes}
        onNo={handlePrePromptNo}
      />
    </View>
  );
}
