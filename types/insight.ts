export type InsightDirection = "positive" | "negative" | "unknown";

export interface CorrelationInsight {
  key: string;
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
