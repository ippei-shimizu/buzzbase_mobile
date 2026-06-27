import React from "react";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 今日の目標進捗。実体は #323 目標設定で差し込む。 */
export function TodayGoalSection() {
  return (
    <SectionCard title="今日の目標">
      <SectionPlaceholder message="目標を設定すると、達成度がここに表示されます" />
    </SectionCard>
  );
}
