export const WEEK_DAYS: { num: number; label: string }[] = [
  { num: 1, label: "月" },
  { num: 2, label: "火" },
  { num: 3, label: "水" },
  { num: 4, label: "木" },
  { num: 5, label: "金" },
  { num: 6, label: "土" },
  { num: 7, label: "日" },
];

export const dayLabels = (daysOfWeek: string): string =>
  daysOfWeek
    .split(",")
    .map(
      (value) =>
        WEEK_DAYS.find((day) => day.num === Number(value))?.label ?? "",
    )
    .join("・");
