import type { IconName } from "../../../types/icon";
import type { Feature, PlanType, ProFeature } from "../../../types/pro";
import type { ProTrigger } from "@utils/analytics";
import { Platform } from "react-native";
import {
  type CustomerInfo,
  type PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { PRO_FEATURES } from "../../../types/pro";

/**
 * Paywall（PaywallModal / app/pro）で共有する訴求コピー・比較表・FAQ・純粋ヘルパー。
 * UI コンポーネントを持たないモジュールに分離し、価値画面とプラン画面の両方から
 * 循環参照なしで参照できるようにしている。
 */

// 解約導線の案内で実行中プラットフォームのストア名だけを出す。
// 他ストア名を混在させると App Store の審査ガイドライン 2.3.10 に抵触する。
export const STORE_LABEL =
  Platform.OS === "android" ? "Google Play" : "App Store";

export interface PaywallCopy {
  title: string;
  description: string;
  /** 2〜4行の具体的なメリット箇条書き。指定時は description より優先して表示する。 */
  benefits?: string[];
}

// Pro 機能ごとの paywall コピー。各機能 Issue で文言を最終調整する想定。
// ProUpsellCard/ProUpsellOverlay 等、ロック表示を出す他コンポーネントからも同じ文言を参照するため export する。
export const PRO_PAYWALL_COPY: Record<ProFeature, PaywallCopy> = {
  no_ads: {
    title: "広告を非表示にして集中する",
    description:
      "Pro プランに加入すると、アプリ内のすべての広告が非表示になります。",
  },
  season_transition_graph: {
    title: "シーズンを跨いだ成長を可視化",
    description:
      "過去複数シーズンの成績を折れ線グラフで比較して、長期的な成長を確認できます。",
  },
  grass_full_history: {
    title: "練習履歴を全期間で確認",
    description:
      "草機能のヒートマップを全期間で表示。継続の積み重ねを実感できます。",
  },
  unlimited_practice_menus: {
    title: "練習メニューを無制限に登録",
    description:
      "Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
  },
  unlimited_media_uploads: {
    title: "動画・画像を無制限にアップロード",
    description: "月3点までの制限を撤廃。練習映像をいくらでも保存できます。",
  },
  schedule_copy_next_week: {
    title: "今週のプランを来週にまるごとコピー",
    description:
      "Pro プランなら今週登録した予定をワンタップで来週にコピーでき、プラン作りの手間を省けます。",
  },
  unlimited_menu_sets: {
    title: "メニューセットを無制限に作成",
    description:
      "よく組む練習をセットにして、予定登録や週プランでそのまま使い回せます。",
  },
  unlimited_monthly_goals: {
    title: "月次目標を複数管理",
    description: "打撃・投手・走塁など複数の目標を同時に追跡できます。",
  },
  season_goals: {
    title: "シーズン目標を設定",
    description:
      "1シーズンを通した中長期目標を設定し、月次目標と紐づけて追跡できます。",
  },
  tournament_goals: {
    title: "大会目標を設定",
    description:
      "特定の大会に向けた目標を設定し、その大会の成績で達成を追跡できます。",
  },
  custom_notification_messages: {
    title: "通知メッセージをカスタマイズ",
    description: "練習リマインドや目標達成通知の文言を自分好みに編集できます。",
  },
  detailed_condition_log: {
    title: "コンディションを詳しく記録",
    description:
      "体調・気分・睡眠などを細かく記録し、調子の良し悪しの傾向を把握できます。",
  },
  unlimited_improvement_themes: {
    title: "取り組む課題を無制限に",
    description:
      "複数の課題を同時に設定して、練習やノートをそれぞれの課題に束ねられます。",
  },
  correlation_insights: {
    title: "練習と成績の関係を発見",
    description:
      "素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。",
  },
  unlimited_reflection_templates: {
    title: "振り返りテンプレを自由に作成",
    description:
      "自分専用の問いかけテンプレをいくつでも作って、振り返りの質を高められます。",
  },
  advanced_periodic_review: {
    title: "週次・月次の振り返りレポートを受け取る",
    description:
      "練習量や成績の変化、課題別の取り組み状況、練習と成績のつながりを週末・月末に自動でまとめてお届けします。",
  },
  note_tags: {
    title: "野球ノートにタグを付けて整理",
    description:
      "Pro プランなら野球ノートにタグを付けて、後から振り返りやすく整理できます。",
    benefits: [
      "練習の気づきや試合の振り返りをタグで分類",
      "過去のノートをタグから素早く検索",
      "自分専用のタグも自由に作成可能",
    ],
  },
  multi_game_result_notes: {
    title: "1つのノートに複数の試合を紐付け",
    description:
      "Pro プランなら1つの野球ノートに複数の試合記録を紐付けて振り返れます。",
  },
  multi_improvement_theme_links: {
    title: "1つの記録に複数の課題を紐付け",
    description:
      "Pro プランなら練習記録・野球ノートに複数の課題を同時に紐付けて、取り組みをまとめて振り返れます。",
  },
  practice_menu_trend_detail: {
    title: "メニューごとの推移を詳しく見る",
    description:
      "期間を絞ったグラフや数値の内訳など、メニューごとの詳細な推移をいつでも振り返れます。",
  },
  custom_period_goals: {
    title: "カスタム期間で目標を設定",
    description:
      "「大会前3週間」のように自分で決めた期間で目標を設定し、進み具合を追跡できます。",
  },
  manual_metric_goals: {
    title: "自由指標で目標を設定",
    description:
      "球速や体重など、アプリが自動集計できない自分だけの指標も目標にして手入力で管理できます。",
  },
  shadow_swing_custom_interval: {
    title: "インターバルを自由に設定",
    description:
      "1秒〜20秒の全範囲でインターバルを設定できます。自分のテンポに合わせて素振りを鍛えましょう。",
  },
  shadow_swing_vibration: {
    title: "バイブレーションでテンポを取る",
    description:
      "音を出せない場所でもバイブレーションでインターバルを把握しながら素振りできます。",
  },
  shadow_swing_background: {
    title: "バックグラウンドでも継続実行",
    description:
      "画面ロックやアプリの切り替えで途切れず、素振りの本数と経過時間をそのまま継続できます。",
  },
  schedule_calendar_full_history: {
    title: "カレンダーを全期間閲覧",
    description:
      "先々の予定や過去の練習プランも、月を遡らずカレンダーでいつでも確認できます。",
  },
  unlimited_groups: {
    title: "グループを無制限に作成・参加",
    description:
      "Pro プランなら2つ目以降のグループも自由に作成・参加できます。チームを掛け持ちしているメンバーも安心です。",
    benefits: [
      "所属チームと学年・代のグループを分けて成績を共有",
      "習い事や別チームの仲間とも、それぞれのグループでつながれる",
      "新チームのグループを作っても、前の代のグループはそのまま残せる",
    ],
  },
  hit_direction_average: {
    title: "方向別の打率",
    description: "打球を打った方向ごとの打率をヒートマップで可視化します。",
  },
  count_situation_average: {
    title: "カウント別の打率",
    description:
      "初球・有利カウント・追い込みなど、カウント状況別の打率がわかります。",
  },
  pitch_type_average: {
    title: "球種別の打率",
    description: "ストレートや変化球など、球種ごとの得意・苦手が分析できます。",
  },
  pitch_course_average: {
    title: "コース別の打率",
    description:
      "5×5のコース別ヒートマップで得意・苦手なコースがわかります。球種別のクロス集計にも対応。",
  },
  pitcher_faceoff_average: {
    title: "対戦投手別",
    description: "対戦した投手ごとの打撃成績を一覧で確認できます。",
  },
};

export const DEFAULT_COPY: PaywallCopy = {
  title: "Pro 加入で BUZZ BASE をフル活用",
  description: "Pro プランで全機能のロックを解除できます。",
};

interface FeatureComparison {
  free: string;
  pro: string;
}

// 「PRO でできること」表の無料/PROセル文言。type/pro.ts のコメント・実装済みの
// ゲーティング挙動（完全ロックのものは ✕/○、件数上限は具体的な数字）を基に決定。
export const FEATURE_COMPARISONS: Record<ProFeature, FeatureComparison> = {
  no_ads: { free: "表示あり", pro: "非表示" },
  season_transition_graph: { free: "単年のみ", pro: "複数年比較" },
  grass_full_history: { free: "直近30日", pro: "全期間" },
  unlimited_practice_menus: { free: "3件", pro: "無制限" },
  unlimited_media_uploads: { free: "月3件", pro: "無制限" },
  schedule_copy_next_week: { free: "手動", pro: "1タップ" },
  unlimited_menu_sets: { free: "2件", pro: "無制限" },
  unlimited_monthly_goals: { free: "2件", pro: "無制限" },
  season_goals: { free: "✕", pro: "○" },
  tournament_goals: { free: "✕", pro: "○" },
  custom_notification_messages: { free: "標準文言", pro: "自由編集" },
  detailed_condition_log: { free: "✕", pro: "○" },
  unlimited_improvement_themes: { free: "2件", pro: "無制限" },
  correlation_insights: { free: "✕", pro: "○" },
  unlimited_reflection_templates: { free: "1件", pro: "無制限" },
  advanced_periodic_review: { free: "✕", pro: "○" },
  note_tags: { free: "✕", pro: "○" },
  multi_game_result_notes: { free: "1件", pro: "複数件" },
  multi_improvement_theme_links: { free: "1件", pro: "複数件" },
  practice_menu_trend_detail: { free: "✕", pro: "○" },
  custom_period_goals: { free: "✕", pro: "○" },
  manual_metric_goals: { free: "✕", pro: "○" },
  shadow_swing_custom_interval: { free: "5〜8秒", pro: "1〜20秒" },
  shadow_swing_vibration: { free: "✕", pro: "○" },
  shadow_swing_background: { free: "✕(一時停止)", pro: "○" },
  schedule_calendar_full_history: { free: "前後3ヶ月", pro: "全期間" },
  unlimited_groups: { free: "1件", pro: "無制限" },
  hit_direction_average: { free: "✕", pro: "○" },
  count_situation_average: { free: "✕", pro: "○" },
  pitch_type_average: { free: "✕", pro: "○" },
  pitch_course_average: { free: "✕", pro: "○" },
  pitcher_faceoff_average: { free: "✕", pro: "○" },
};

interface FeatureGroup {
  title: string;
  icon: IconName;
  keys: ProFeature[];
}

// 「PRO でできること」表のグループ分け。PRO_FEATURES 全31項目を過不足なく1回ずつ含む
// （テストで網羅性を担保。詳細は __tests__/PaywallModal.test.tsx）。
// グループ名・アイコンはホーム画面の実際のセクション名・導線に合わせる
// （例: ImprovementToolsSection の各ツール名）。ただし「練習ツール」だけは
// 中身が素振りカウントタイマーの機能に限られるため、何が使えるようになるかが
// 伝わるようツール名そのものを見出しにしている。
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "練習を記録",
    icon: "barbell-outline",
    keys: ["detailed_condition_log", "multi_improvement_theme_links"],
  },
  {
    title: "野球ノート",
    icon: "book-outline",
    keys: [
      "note_tags",
      "multi_game_result_notes",
      "unlimited_media_uploads",
      "unlimited_reflection_templates",
    ],
  },
  {
    title: "予定・プラン管理",
    icon: "calendar-outline",
    keys: [
      "unlimited_practice_menus",
      "unlimited_menu_sets",
      "schedule_copy_next_week",
      "schedule_calendar_full_history",
    ],
  },
  {
    title: "目標管理",
    icon: "trophy-outline",
    keys: [
      "unlimited_monthly_goals",
      "season_goals",
      "tournament_goals",
      "custom_period_goals",
      "manual_metric_goals",
    ],
  },
  {
    title: "課題管理",
    icon: "flag-outline",
    keys: ["unlimited_improvement_themes"],
  },
  {
    title: "成績",
    icon: "stats-chart-outline",
    keys: [
      "season_transition_graph",
      "practice_menu_trend_detail",
      "hit_direction_average",
      "count_situation_average",
      "pitch_type_average",
      "pitch_course_average",
      "pitcher_faceoff_average",
    ],
  },
  {
    title: "振り返りレポート",
    icon: "sparkles-outline",
    keys: ["advanced_periodic_review"],
  },
  {
    title: "練習と成績のつながり",
    icon: "trending-up",
    keys: ["correlation_insights"],
  },
  {
    title: "素振りカウントタイマー",
    icon: "timer-outline",
    keys: [
      "shadow_swing_custom_interval",
      "shadow_swing_vibration",
      "shadow_swing_background",
    ],
  },
  {
    title: "継続",
    icon: "flame-outline",
    keys: ["grass_full_history"],
  },
  {
    title: "グループ",
    icon: "people-outline",
    keys: ["unlimited_groups"],
  },
  {
    title: "その他",
    icon: "ellipsis-horizontal-circle-outline",
    keys: ["custom_notification_messages", "no_ads"],
  },
];

// ハイライトカードで既に強調表示中の feature をグループ内から除外し、0件になった
// グループは非表示にする。
export function filterFeatureGroups(
  groups: FeatureGroup[],
  excludeFeature?: Feature,
): FeatureGroup[] {
  return groups
    .map((group) => ({
      ...group,
      keys: group.keys.filter((key) => key !== excludeFeature),
    }))
    .filter((group) => group.keys.length > 0);
}

// RevenueCat の packageType は Offering 設定に依存するため、未知の値は product.title にフォールバックする。
export const PLAN_LABELS: Partial<
  Record<PACKAGE_TYPE, { name: string; period: string }>
> = {
  MONTHLY: { name: "月額プラン", period: "/月" },
  ANNUAL: { name: "年額プラン", period: "/年" },
  SIX_MONTH: { name: "半年プラン", period: "/6ヶ月" },
  THREE_MONTH: { name: "3ヶ月プラン", period: "/3ヶ月" },
  TWO_MONTH: { name: "2ヶ月プラン", period: "/2ヶ月" },
  WEEKLY: { name: "週額プラン", period: "/週" },
  LIFETIME: { name: "買い切りプラン", period: "" },
};

// RevenueCat の packageType は 7 種類あるが、課金ファネルの集計軸は back の
// ProSubscription#plan_type（monthly / yearly）に揃える。対応しないプランは null。
export const toPlanType = (packageType: PACKAGE_TYPE): PlanType | null => {
  if (packageType === "MONTHLY") return "monthly";
  if (packageType === "ANNUAL") return "yearly";
  return null;
};

/**
 * 購入結果がトライアル開始だったか。`has_used_trial` から導く「トライアル権利の有無」は
 * 判定確定前に false へ倒れるうえ、権利があってもトライアル無しで買った場合に true に
 * なるため、購入後の CustomerInfo の periodType を見る。
 *
 * 引数はネイティブ Module 由来のため、欠けていても false を返して落とさない。
 * ここで例外を投げると課金済みのユーザーが同期・成功画面に到達できなくなる。
 */
export const isTrialPurchase = (
  customerInfo: CustomerInfo | null | undefined,
): boolean =>
  Object.values(customerInfo?.entitlements?.active ?? {}).some(
    (entitlement) => entitlement.periodType === "TRIAL",
  );

/**
 * 購入失敗の理由を計測用の短い識別子にする。未知のコードも数値のまま残して
 * PostHog 側で内訳を追えるようにする。
 */
export const purchaseFailureReason = (
  code: PURCHASES_ERROR_CODE | undefined,
): string => {
  if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
    return "payment_pending";
  }
  if (code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
    return "already_purchased";
  }
  if (code === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
    return "purchase_not_allowed";
  }
  return code == null ? "unknown" : `code_${code}`;
};

/**
 * Pro 訴求の起点キーを計測用に正規化する。`feature` は FreeFeature や URL 由来の
 * 任意文字列も取りうるため、PRO_FEATURES に無いキーと未指定は "general" に倒す。
 */
export const toProTrigger = (feature: string | undefined): ProTrigger =>
  feature && (PRO_FEATURES as readonly string[]).includes(feature)
    ? (feature as ProFeature)
    : "general";

export const isUserCancelled = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { userCancelled?: boolean }).userCancelled === true;

/**
 * 価値画面で「加入前の不安」を解消するための FAQ。
 * 解約後もデータが残ることを明示するのは、トライアル解約者が「見終わったら終わり」と
 * 受け取って短期解約するのを避けるため。
 */
export const PAYWALL_FAQ: readonly { question: string; answer: string }[] = [
  {
    question: "無料トライアル中に解約したら料金はかかりますか？",
    answer:
      "かかりません。トライアル期間が終わる前に解約すれば請求は発生せず、期間の終わりまでは Pro 機能を使えます。",
  },
  {
    question: "解約すると記録したデータは消えますか？",
    answer:
      "消えません。試合・打席・練習の記録はそのまま残り、Pro 限定の分析表示だけがロックされます。再加入すればすぐに元の分析を見られます。",
  },
  {
    question: "機種変更しても引き継げますか？",
    answer: `同じアカウントでログインすれば引き継げます。反映されない場合はプラン画面の「購入を復元」から ${STORE_LABEL} の購入履歴を読み込めます。`,
  },
  {
    question: "解約はどこからできますか？",
    answer: `${STORE_LABEL} のサブスクリプション設定からいつでも解約できます。アプリの「サブスクリプション管理」からも手順を確認できます。`,
  },
];

/**
 * 年額プランの月あたり金額。「¥4,800/年」だけでは月額との比較ができないため、
 * プラン画面で月換算を併記する。表示は formatCurrency に通して通貨を揃える。
 * @returns 月あたりの金額。年額プランでないときは null
 */
export const monthlyEquivalent = (
  packageType: PACKAGE_TYPE,
  price: number,
): number | null => (packageType === "ANNUAL" ? price / 12 : null);

/**
 * ストアの通貨で金額を整形する。RevenueCat の priceString はストアのロケールで
 * 返るため、月あたり・お得額のような自前の派生値も同じ通貨で出さないと
 * 「$29.99/年」の隣に「¥3」が並ぶような食い違いが起きる。
 *
 * @param amount 金額（product.price と同じ通貨単位）
 * @param currencyCode product.currencyCode
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string,
): string => {
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    // 端末の Intl が通貨コードを解決できない場合は記号を足さず、数値と通貨コードを出す。
    return `${Math.round(amount).toLocaleString()} ${currencyCode}`;
  }
};
