export interface Tag {
  id: number;
  name: string;
  is_preset: boolean;
}

export interface TagInput {
  name: string;
}

/** 表示用のタグ名（先頭に # を付ける）。保存名には # を含めない。 */
export const tagLabel = (name: string): string => `#${name}`;
