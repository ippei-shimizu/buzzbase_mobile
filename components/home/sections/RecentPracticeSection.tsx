import React from "react";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 最近の練習タイムライン（量ログ＋紐付いたノート）。実体は #321 練習記録で差し込む。 */
export function RecentPracticeSection() {
  return (
    <SectionCard title="最近の練習">
      <SectionPlaceholder message="記録した練習がここに新しい順で並びます" />
    </SectionCard>
  );
}
