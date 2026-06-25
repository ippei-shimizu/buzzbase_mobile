import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  computeBattingStats,
  hitDirectionToLegacy,
} from "@constants/battingData";
import {
  createGameResult,
  updateGameResult,
  createMatchResult,
  updateMatchResult,
  createBattingAverage,
  updateBattingAverage,
  updateBattingAverageId,
  createPitchingResult,
  updatePitchingResult,
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
import { getCurrentUserProfile } from "../services/profileService";
import { createSeason } from "../services/seasonService";
import { useGameRecordStore } from "../stores/gameRecordStore";
import { invalidateGameResultRelated } from "../utils/queryInvalidation";

export const useGameRecord = () => {
  const store = useGameRecordStore();
  const queryClient = useQueryClient();

  /** ストアのuserIdを取得。nullならプロファイルAPIから取得してストアにセットする */
  const resolveUserId = async (): Promise<number> => {
    const s = useGameRecordStore.getState();
    if (s.userId) return s.userId;
    const profile = await getCurrentUserProfile();
    store.setField("userId", profile.id);
    return profile.id;
  };

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

  /** Step1送信: matchResult作成or更新 → gameResult更新 */
  const submitStep1 = useMutation({
    mutationFn: async () => {
      // submit 直前に画面側で setField された値（新規球場の stadium_id 等）を確実に読むため、
      // レンダー時スナップショットの store ではなく getState() で最新状態を取得する（step2/3 と統一）。
      const s = useGameRecordStore.getState();

      // チームIDを取得または作成
      let myTeamId = s.myTeamId;
      let opponentTeamId = s.opponentTeamId;

      if (!myTeamId && s.myTeamName) {
        const team = await createTeam(s.myTeamName);
        myTeamId = team.id;
        store.setField("myTeamId", team.id);
      }
      if (!opponentTeamId && s.opponentTeamName) {
        const team = await createTeam(s.opponentTeamName);
        opponentTeamId = team.id;
        store.setField("opponentTeamId", team.id);
      }

      if (!myTeamId || !opponentTeamId) {
        throw new Error("チームを選択してください");
      }

      // 大会名の処理
      let tournamentId = s.tournamentId;
      if (!tournamentId && s.tournamentName.trim()) {
        const tournament = await createTournament(s.tournamentName.trim());
        tournamentId = tournament.id;
        store.setField("tournamentId", tournament.id);
      }

      // シーズン名の処理: 既存選択（seasonId 有）はそのまま、未選択で名前のみ入力されていれば新規作成する
      let seasonId = s.seasonId;
      if (!seasonId && s.seasonName.trim()) {
        const season = await createSeason({ name: s.seasonName.trim() });
        seasonId = season.id;
        store.setField("seasonId", season.id);
        queryClient.invalidateQueries({ queryKey: ["seasons"] });
      }

      const matchResultPayload = {
        game_result_id: s.gameResultId!,
        date_and_time: `${s.date}T00:00:00`,
        match_type: s.matchType,
        my_team_id: myTeamId,
        opponent_team_id: opponentTeamId,
        // Step1 画面のバリデーションで null は弾かれている前提だが、
        // 万一のために 0 へフォールバック（API は数値必須のため）。
        my_team_score: s.myTeamScore ?? 0,
        opponent_team_score: s.opponentTeamScore ?? 0,
        batting_order: s.battingOrder,
        defensive_position: s.defensivePosition,
        memo: s.memo,
        inning_format: s.inningFormat,
        appearance_type: s.appearanceType,
        // 球場は任意項目。未選択時は null を送って明示的に外す（編集モードで解除可能にする）。
        stadium_id: s.stadiumId,
        ...(tournamentId ? { tournament_id: tournamentId } : {}),
      };

      if (s.matchResultId) {
        await updateMatchResult(s.matchResultId, matchResultPayload);
        // updateMatchResult は match_result テーブルのみ更新するため、
        // game_result.season_id は別途明示的に更新する必要がある。
        await updateGameResult(s.gameResultId!, {
          season_id: seasonId,
        });
      } else {
        const matchResult = await createMatchResult(matchResultPayload);
        store.setField("matchResultId", matchResult.id);

        await updateGameResult(s.gameResultId!, {
          match_result_id: matchResult.id,
          season_id: seasonId,
        });
      }
    },
  });

  /** Step2送信: 打席結果を個別送信 → 打撃成績を自動計算して作成or更新 → gameResultに紐付け */
  const submitStep2 = useMutation({
    mutationFn: async () => {
      const s = useGameRecordStore.getState();
      const stats = computeBattingStats(s.battingBoxes);

      // 未記入ならスキップ
      const isBattingEmpty =
        stats.plateAppearances === 0 &&
        s.runsBattedIn === 0 &&
        s.run === 0 &&
        s.stealingBase === 0 &&
        s.caughtStealing === 0 &&
        s.battingError === 0;

      if (isBattingEmpty) return;

      const userId = await resolveUserId();

      // 打席ごとにplate_appearanceを送信
      const filteredBoxes = s.battingBoxes.filter((box) => box.result !== 0);
      for (let i = 0; i < filteredBoxes.length; i++) {
        const box = filteredBoxes[i];
        const resultText = box.text.replace("-", "");
        if (!resultText) continue;

        const plateAppearanceData = {
          plate_appearance: {
            game_result_id: s.gameResultId!,
            user_id: userId,
            batter_box_number: i + 1,
            batting_result: resultText,
            batting_position_id:
              hitDirectionToLegacy[box.position] ?? box.position,
            plate_result_id: box.result,
            hit_direction_id: box.position > 0 ? box.position : undefined,
          },
        };

        const existing = await checkExistingPlateAppearance(
          s.gameResultId!,
          userId,
          i + 1,
        );
        if (existing) {
          await updatePlateAppearance(existing.id, plateAppearanceData);
        } else {
          await createPlateAppearance(plateAppearanceData);
        }
      }

      const battingAveragePayload = {
        game_result_id: s.gameResultId!,
        user_id: userId,
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
      };

      if (s.battingAverageId) {
        await updateBattingAverage(s.battingAverageId, battingAveragePayload);
      } else {
        const battingAverage = await createBattingAverage(
          battingAveragePayload,
        );
        store.setField("battingAverageId", battingAverage.id);

        await updateBattingAverageId(s.gameResultId!, {
          batting_average_id: battingAverage.id,
        });
      }
    },
  });

  /** Step3送信: pitchingResult作成or更新 → gameResultに紐付け */
  const submitStep3 = useMutation({
    mutationFn: async () => {
      const s = useGameRecordStore.getState();
      const inningsPitched =
        s.inningsPitchedWhole + s.inningsPitchedFraction / 3;

      // 未記入ならスキップ
      const isPitchingEmpty =
        inningsPitched === 0 &&
        s.win === 0 &&
        s.loss === 0 &&
        s.hold === 0 &&
        s.saves === 0 &&
        s.numberOfPitches === 0 &&
        !s.gotToTheDistance &&
        s.runAllowed === 0 &&
        s.earnedRun === 0 &&
        s.hitsAllowed === 0 &&
        s.homeRunsHit === 0 &&
        s.strikeouts === 0 &&
        s.pitchingBaseOnBalls === 0 &&
        s.pitchingHitByPitch === 0;

      if (isPitchingEmpty) return;

      const userId = await resolveUserId();

      const pitchingResultPayload = {
        game_result_id: s.gameResultId!,
        user_id: userId,
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
      };

      if (s.pitchingResultId) {
        await updatePitchingResult(s.pitchingResultId, pitchingResultPayload);
      } else {
        const pitchingResult = await createPitchingResult(
          pitchingResultPayload,
        );
        store.setField("pitchingResultId", pitchingResult.id);

        await updatePitchingResultId(s.gameResultId!, {
          pitching_result_id: pitchingResult.id,
        });
      }
    },
  });

  const resetFlow = () => {
    store.reset();
    invalidateGameResultRelated(queryClient);
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
