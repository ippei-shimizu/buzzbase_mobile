/**
 * 練習量（amount）を表示用に整形する。
 * amount はバックエンドで decimal(10,2)（距離 km など小数が要る）だが、
 * 回数・分などは整数で扱うため、整数値のときは小数点を出さない。
 *
 * @example formatAmount(300) => "300"  / formatAmount(5.5) => "5.5" / formatAmount(null) => ""
 */
export const formatAmount = (
  amount: number | string | null | undefined,
): string => {
  if (amount == null || amount === "") return "";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "";
  // Number(...) が "300.00" → 300、5.50 → 5.5 と末尾ゼロを落とす。
  return String(value);
};
