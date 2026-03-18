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
  getTournaments,
  createTournament,
} from "../services/gameRecordService";
import {
  createPlateAppearance,
  checkExistingPlateAppearance,
  updatePlateAppearance,
} from "../services/plateAppearanceService";
import { computeBattingStats } from "@constants/battingData";

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

  const tournamentsQuery = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
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

      // 大会名の処理
      let tournamentId = store.tournamentId;
      if (!tournamentId && store.tournamentName.trim()) {
        const tournament = await createTournament(store.tournamentName.trim());
        tournamentId = tournament.id;
        store.setField("tournamentId", tournament.id);
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
        ...(tournamentId ? { tournament_id: tournamentId } : {}),
      });

      store.setField("matchResultId", matchResult.id);

      await updateGameResult(store.gameResultId!, {
        match_result_id: matchResult.id,
        season_id: store.seasonId,
      });
    },
  });

  /** Step2送信: 打席結果を個別送信 → 打撃成績を自動計算して作成 → gameResultに紐付け */
  const submitStep2 = useMutation({
    mutationFn: async () => {
      const s = useGameRecordStore.getState();
      const stats = computeBattingStats(s.battingBoxes);

      // 打席ごとにplate_appearanceを送信
      const filteredBoxes = s.battingBoxes.filter((box) => box.result !== 0);
      for (let i = 0; i < filteredBoxes.length; i++) {
        const box = filteredBoxes[i];
        const resultText = box.text.replace("-", "");
        if (!resultText) continue;

        const plateAppearanceData = {
          plate_appearance: {
            game_result_id: s.gameResultId!,
            user_id: s.userId!,
            batter_box_number: i + 1,
            batting_result: resultText,
            batting_position_id: box.position,
            plate_result_id: box.result,
          },
        };

        const existing = await checkExistingPlateAppearance(
          s.gameResultId!,
          s.userId!,
          i + 1,
        );
        if (existing) {
          await updatePlateAppearance(existing.id, plateAppearanceData);
        } else {
          await createPlateAppearance(plateAppearanceData);
        }
      }

      // 打撃成績を作成
      const battingAverage = await createBattingAverage({
        game_result_id: s.gameResultId!,
        user_id: s.userId!,
        plate_appearances: stats.plateAppearances,
        times_at_bat: stats.timesAtBat,
        hit: stats.hit,
        two_base_hit: stats.twoBaseHit,
        three_base_hit: stats.threeBaseHit,
        home_run: stats.homeRun,
        total_bases: stats.totalBases,
        runs_batted_in: s.runsBattedIn,
        run: s.run,
        strike_out: stats.strikeOuts,
        base_on_balls: stats.baseOnBalls,
        hit_by_pitch: stats.hitByPitch,
        sacrifice_hit: stats.sacrificeHit,
        sacrifice_fly: stats.sacrificeFly,
        stealing_base: s.stealingBase,
        caught_stealing: s.caughtStealing,
        at_bats: stats.atBats,
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
    tournamentsQuery,
    createGameResultMutation,
    createTeamMutation,
    submitStep1,
    submitStep2,
    submitStep3,
    resetFlow,
  };
};
