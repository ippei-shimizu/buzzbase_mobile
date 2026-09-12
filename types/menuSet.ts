export interface MenuSetItem {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  target_value: number | null;
}

export interface MenuSet {
  id: number;
  name: string;
  note: string | null;
  sort_order: number;
  items: MenuSetItem[];
}

export interface MenuSetInput {
  name: string;
  note?: string | null;
  sort_order?: number;
  items?: { practice_menu_id: number; target_value?: number | null }[];
}
