import { useState } from "react";

/**
 * 複数行を同時に展開できるリストの展開状態。rows が差し替わっても状態は持ち越す。
 * @returns 展開中の id 集合と、指定 id の開閉を切り替える関数
 */
export const useExpandedIds = () => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return { expandedIds, toggleExpanded };
};
