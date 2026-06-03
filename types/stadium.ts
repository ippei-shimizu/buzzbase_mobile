/**
 * 球場マスタの型定義。
 * back の `app/serializers/v2/stadium_serializer.rb` のレスポンス形に揃える。
 * snake_case はバックエンドの慣習に従う（mobile プロジェクトルール）。
 */
export interface StadiumPrefecture {
  id: number;
  name: string;
}

export interface Stadium {
  id: number;
  name: string;
  prefecture: StadiumPrefecture | null;
}

export interface StadiumSearchResponse {
  data: Stadium[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface CreateStadiumPayload {
  name: string;
  prefecture_id?: number;
}
