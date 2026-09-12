export type InsightDirection = "positive" | "negative" | "unknown";

export interface CorrelationInsight {
  key: string;
  // 自作カードは組み合わせ id を持つ（削除可能）。プリセットは null。
  id: number | null;
  title: string;
  body: string;
  metric: string;
  dimension: string;
  direction: InsightDirection;
  strength: string;
  sample_weeks: number;
  sufficient: boolean;
}

export interface CorrelationInsightsResponse {
  insights: CorrelationInsight[];
}

export interface InsightCombinationInput {
  input_type: string;
  practice_menu_id?: number | null;
  metric: string;
}
