export interface SlateNode {
  children: { text: string }[];
}

// 一覧API用（memoは切り詰めテキスト）
export interface BaseballNoteListItem {
  id: number;
  title: string;
  date: string;
  memo: string;
  created_at: string;
  updated_at: string;
}

// 詳細API用（memoはフルJSON文字列）
export interface BaseballNote {
  id: number;
  title: string;
  date: string;
  memo: string; // JSON文字列
  created_at: string;
  updated_at: string;
}

// 作成/更新パラメータ
export interface BaseballNoteParams {
  title: string;
  date: string;
  memo: string; // JSON.stringify(SlateNode[])
}
