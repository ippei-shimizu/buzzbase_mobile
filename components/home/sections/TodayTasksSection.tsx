import React from "react";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 今日のやること（スケジュール由来）。実体は #324 スケジュールで差し込む。 */
export function TodayTasksSection() {
  return (
    <SectionCard title="今日のやること">
      <SectionPlaceholder message="自主練スケジュールを設定すると、今日の予定がここに並びます" />
    </SectionCard>
  );
}
