import React from "react";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/**
 * クイック記録（素振り / 練習を記録 / コンディション）。
 * 記録導線の実体は #321 練習記録・#319 素振りで差し込む。
 */
export function QuickRecordSection() {
  return (
    <SectionCard title="クイック記録">
      <SectionPlaceholder message="素振り・練習の記録導線がここに入ります" />
    </SectionCard>
  );
}
