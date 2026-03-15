import { Share } from "react-native";
import type { GameResult } from "../types/gameResult";

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const shareGameResult = async (game: GameResult): Promise<void> => {
  const { match_result, batting_average, pitching_result } = game;

  const lines: string[] = [];

  lines.push(
    `${formatDate(match_result.date_and_time)} ${match_result.match_type} vs ${match_result.opponent_team_name} ${match_result.my_team_score}-${match_result.opponent_team_score}`,
  );

  if (batting_average) {
    const parts = [`${batting_average.at_bats}打数${batting_average.hit}安打`];
    if (batting_average.home_run > 0) {
      parts.push(`${batting_average.home_run}本塁打`);
    }
    if (batting_average.runs_batted_in > 0) {
      parts.push(`${batting_average.runs_batted_in}打点`);
    }
    lines.push(`打撃: ${parts.join(" ")}`);
  }

  if (pitching_result) {
    const parts = [
      `${pitching_result.innings_pitched}回`,
      `${pitching_result.strikeouts}K`,
      `自責${pitching_result.earned_run}`,
    ];
    lines.push(`投球: ${parts.join(" ")}`);
  }

  lines.push("#BUZZBASE");

  await Share.share({ message: lines.join("\n") });
};
