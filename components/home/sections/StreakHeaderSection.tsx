import React from "react";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 継続ヘッダー（Streak ＋ 直近の草ミニ）。実体は #320 草・Streak で差し込む。 */
export function StreakHeaderSection() {
  return (
    <SectionCard title="継続">
      <SectionPlaceholder message="練習を記録すると、連続日数と草がここに表示されます" />
    </SectionCard>
  );
}
