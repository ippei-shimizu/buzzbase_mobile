import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameRecordStore } from "../stores/gameRecordStore";
import {
  createGameResult,
  updateGameResult,
  createMatchResult,
  createBattingAverage,
  updateBattingAverageId,
  createPitchingResult,
  updatePitchingResultId,
  getTeams,
  getPositions,
  createTeam,
} from "../services/gameRecordService";

export const useGameRecord = () => {
  const store = useGameRecordStore();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const positionsQuery = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
  });

  const createGameResultMutation = useMutation({
    mutationFn: createGameResult,
    onSuccess: (data) => {
      store.setField("gameResultId", data.id);
      store.setField("userId", data.user_id);
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  /** Step1送信: matchResult作成 → gameResult更新 */
  const submitStep1 = useMutation({
    mutationFn: async () => {
      // チームIDを取得または作成
      let myTeamId = store.myTeamId;
      let opponentTeamId = store.opponentTeamId;

      if (!myTeamId && store.myTeamName) {
        const team = await createTeam(store.myTeamName);
        myTeamId = team.id;
        store.setField("myTeamId", team.id);
      }
      if (!opponentTeamId && store.opponentTeamName) {
        const team = await createTeam(store.opponentTeamName);
        opponentTeamId = team.id;
        store.setField("opponentTeamId", team.id);
      }

      if (!myTeamId || !opponentTeamId) {
        throw new Error("チームを選択してください");
      }

      const matchResult = await createMatchResult({
        game_result_id: store.gameResultId!,
        date_and_time: `${store.date}T00:00:00`,
        match_type: store.matchType,
        my_team_id: myTeamId,
        opponent_team_id: opponentTeamId,
        my_team_score: store.myTeamScore,
        opponent_team_score: store.opponentTeamScore,
        batting_order: store.battingOrder,
        defensive_position: store.defensivePosition,
        memo: store.memo,
      });

      store.setField("matchResultId", matchResult.id);

      await updateGameResult(store.gameResultId!, {
        match_result_id: matchResult.id,
      });
    },
  });

  /** Step2送信: battingAverage作成 → gameResultに紐付け */
  const submitStep2 = useMutation({
    mutationFn: async () => {
      store.computeTotalBases();
      const s = useGameRecordStore.getState();

      const battingAverage = await createBattingAverage({
        game_result_id: s.gameResultId!,
        user_id: s.userId!,
        plate_appearances: s.plateAppearances,
        times_at_bat: s.timesAtBat,
        hit: s.hit,
        two_base_hit: s.twoBaseHit,
        three_base_hit: s.threeBaseHit,
        home_run: s.homeRun,
        total_bases: s.totalBases,
        runs_batted_in: s.runsBattedIn,
        run: s.run,
        strike_out: s.strikeOut,
        base_on_balls: s.baseOnBalls,
        hit_by_pitch: s.hitByPitch,
        sacrifice_hit: s.sacrificeHit,
        sacrifice_fly: s.sacrificeFly,
        stealing_base: s.stealingBase,
        caught_stealing: s.caughtStealing,
        at_bats: s.atBats,
        error: s.battingError,
      });

      store.setField("battingAverageId", battingAverage.id);

      await updateBattingAverageId(s.gameResultId!, {
        batting_average_id: battingAverage.id,
      });
    },
  });

  /** Step3送信: pitchingResult作成 → gameResultに紐付け */
  const submitStep3 = useMutation({
    mutationFn: async () => {
      const s = useGameRecordStore.getState();
      const inningsPitched =
        s.inningsPitchedWhole + s.inningsPitchedFraction / 3;

      const pitchingResult = await createPitchingResult({
        game_result_id: s.gameResultId!,
        user_id: s.userId!,
        win: s.win,
        loss: s.loss,
        hold: s.hold,
        saves: s.saves,
        innings_pitched: Math.round(inningsPitched * 10) / 10,
        number_of_pitches: s.numberOfPitches,
        got_to_the_distance: s.gotToTheDistance,
        run_allowed: s.runAllowed,
        earned_run: s.earnedRun,
        hits_allowed: s.hitsAllowed,
        home_runs_hit: s.homeRunsHit,
        strikeouts: s.strikeouts,
        base_on_balls: s.pitchingBaseOnBalls,
        hit_by_pitch: s.pitchingHitByPitch,
      });

      store.setField("pitchingResultId", pitchingResult.id);

      await updatePitchingResultId(s.gameResultId!, {
        pitching_result_id: pitchingResult.id,
      });
    },
  });

  const resetFlow = () => {
    store.reset();
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return {
    store,
    teamsQuery,
    positionsQuery,
    createGameResultMutation,
    createTeamMutation,
    submitStep1,
    submitStep2,
    submitStep3,
    resetFlow,
  };
};
