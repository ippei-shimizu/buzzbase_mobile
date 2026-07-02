export interface ReflectionTemplate {
  id: number;
  title: string;
  questions: string[];
  is_preset: boolean;
  is_default: boolean;
  sort_order: number;
}

export interface ReflectionTemplateInput {
  title?: string;
  questions?: string[];
  is_default?: boolean;
  sort_order?: number;
}

/** ノートに保存する問い→回答の1組。 */
export interface ReflectionAnswer {
  question: string;
  answer: string;
}
