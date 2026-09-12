import type { ComponentType } from "react";
import { BallIcon } from "@components/icon/BallIcon";
import { GroupTabIcon } from "@components/icon/GroupTabIcon";
import { HomeIcon } from "@components/icon/HomeIcon";
import { StatsIcon } from "@components/icon/StatsIcon";
import { UserIcon } from "@components/icon/UserIcon";

export interface BottomTabItem {
  /** Expo Router ネイティブタブの route 名（(tabs)/_layout.tsx の Tabs.Screen name と一致させる） */
  name: string;
  /** タブに表示するラベル */
  label: string;
  /** (tabs) 外の画面で使う自作 BottomTabBar の遷移先パス */
  href: string;
  /** showBadge はグループタブのみ使用。他アイコンは無視する */
  Icon: ComponentType<{ size?: number; color?: string; showBadge?: boolean }>;
}

/**
 * ボトムナビのタブ項目の唯一の定義。配列の並び順がタブの表示順になる。
 * ネイティブの Tabs（(tabs)/_layout.tsx）と、(tabs) 外の画面で描画する自作
 * BottomTabBar の双方がこれを参照することで、項目・並び順のズレを防ぐ。
 */
export const BOTTOM_TAB_ITEMS: BottomTabItem[] = [
  { name: "index", label: "ホーム", href: "/(tabs)", Icon: HomeIcon },
  {
    name: "(game-results)",
    label: "試合結果",
    href: "/(tabs)/(game-results)",
    Icon: BallIcon,
  },
  { name: "stats", label: "成績", href: "/(tabs)/stats", Icon: StatsIcon },
  {
    name: "(groups)",
    label: "グループ",
    href: "/(tabs)/(groups)",
    Icon: GroupTabIcon,
  },
  {
    name: "(profile)",
    label: "マイページ",
    href: "/(tabs)/(profile)",
    Icon: UserIcon,
  },
];
