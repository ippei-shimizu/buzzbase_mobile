import type { Feature, ProFeature } from "../../types/pro";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PURCHASES_ERROR_CODE,
  type PACKAGE_TYPE,
  type PurchasesOffering,
} from "react-native-purchases";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { syncProStatus } from "@services/proService";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";

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
  pitcher_faceoff_average: { free: "✕", pro: "○" },
};

interface FeatureGroup {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
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

export const isUserCancelled = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { userCancelled?: boolean }).userCancelled === true;

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * ハイライト表示する Pro 機能。未指定（リリース前の告知UIなど、まだ entitlement
   * キーを持たない機能からの呼び出し）の場合は汎用コピーのみを表示する。
   */
  feature?: Feature;
  /**
   * 「なぜ今このモーダルが表示されているか」を伝える状況説明。
   * 上限到達時などピンポイントな事実（例:
   * 「今月の無料上限（3件）に達したため、1件は保存できませんでした」）を渡す。
   * 未指定時はこのモーダルが持つ汎用の機能訴求のみを表示する。
   */
  contextMessage?: string;
}

/**
 * Pro 機能への加入を促す下からせり出すシート型モーダル。
 * feature に対応する訴求コピーを先頭に強調表示し、他の Pro 機能一覧・実際のプラン購入・
 * 購入の復元までをこのシート単体で完結させる。無料機能を誤って渡された場合は汎用コピーで表示する。
 */
export function PaywallModal({
  isOpen,
  onClose,
  feature,
  contextMessage,
}: PaywallModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { enabled: proFeaturesFlag } = useFeatureFlag("pro_features");
  const copy = feature
    ? ((PRO_PAYWALL_COPY as Record<string, PaywallCopy>)[feature] ??
      DEFAULT_COPY)
    : DEFAULT_COPY;

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  // 多重起動の判定は、レンダーを跨がず同期的に読める ref で行う。課金・復元は
  // 非冪等な操作のため、state の反映タイミングに依存させない。UI 表示用の state は
  // ref と常に同時更新するので、呼び出し側は従来どおり setPurchasing / setRestoring を使う。
  const purchasingRef = useRef(false);
  const restoringRef = useRef(false);
  const [purchasing, setPurchasingState] = useState(false);
  const [restoring, setRestoringState] = useState(false);
  const setPurchasing = (value: boolean) => {
    purchasingRef.current = value;
    setPurchasingState(value);
  };
  const setRestoring = (value: boolean) => {
    restoringRef.current = value;
    setRestoringState(value);
  };

  useEffect(() => {
    // pro_features off の間は購入導線自体を出さないため、Offerings取得も不要
    // （RevenueCatへの無駄なリクエストを避ける）。
    if (!isOpen || !proFeaturesFlag) return;
    let cancelled = false;
    setLoadingOfferings(true);
    void (async () => {
      try {
        const result = await getOfferings();
        if (cancelled) return;
        setOffering(result);
        const packages = result?.availablePackages ?? [];
        // 年額があれば「お得」導線として初期選択にする。無ければ最初のプランを選ぶ。
        const preferred =
          packages.find((pkg) => pkg.packageType === "ANNUAL") ?? packages[0];
        setSelectedPackageId(preferred?.identifier ?? null);
      } catch (error: unknown) {
        // RevenueCat 側の商品未登録・App Store Connect 未反映などで取得失敗しても、
        // ペイウォール自体は表示を続け、プラン欄のみ空状態表示にフォールバックする。
        if (!cancelled) {
          Sentry.captureException(error, {
            tags: { source: "revenue_cat_get_offerings" },
          });
        }
      } finally {
        if (!cancelled) setLoadingOfferings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, proFeaturesFlag]);

  // Pro リリース前 / kill switch off では購入導線（プラン一覧・加入・復元）だけを隠す。
  // 無料プランの上限自体はこのフラグと無関係に常時有効なため、理由の説明は出し続ける
  // （説明ごと消すと「操作しても無言で何も起きない」デッドエンドになる）。
  if (!proFeaturesFlag) {
    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="閉じる"
          />
          <View style={styles.sheet} accessibilityViewIsModal>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color="#F4F4F4" />
            </TouchableOpacity>
            <View style={styles.scrollContent}>
              {contextMessage ? (
                <View style={styles.contextBanner}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#D4D4D4"
                  />
                  <Text style={styles.contextBannerText}>{contextMessage}</Text>
                </View>
              ) : null}
              <Text style={styles.highlightDescription}>
                Proプランは近日公開予定です。もうしばらくお待ちください。
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const packages = offering?.availablePackages ?? [];
  const selectedPackage =
    packages.find((pkg) => pkg.identifier === selectedPackageId) ?? null;
  const monthlyPackage = packages.find((pkg) => pkg.packageType === "MONTHLY");
  const annualPackage = packages.find((pkg) => pkg.packageType === "ANNUAL");
  const annualIsDiscounted =
    !!monthlyPackage &&
    !!annualPackage &&
    annualPackage.product.price < monthlyPackage.product.price * 12;
  // 月額を1年間払い続けた場合と比べて年額プランがいくら安いかを金額で表示する。
  const annualSavingsAmount =
    annualIsDiscounted && monthlyPackage && annualPackage
      ? monthlyPackage.product.price * 12 - annualPackage.product.price
      : null;

  const visibleGroups = filterFeatureGroups(FEATURE_GROUPS, feature);

  const handlePurchase = async () => {
    // disabled プロパティだけに頼らず、連打による purchasePackage の多重起動を関数側でも防ぐ。
    if (!selectedPackage || purchasingRef.current) return;
    setPurchasing(true);
    try {
      await purchasePackage(selectedPackage);
    } catch (error: unknown) {
      setPurchasing(false);
      if (isUserCancelled(error)) return;
      const code = (error as { code?: PURCHASES_ERROR_CODE })?.code;
      if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        showSnackbar({
          type: "info",
          message:
            "お支払いが保留中です。承認が完了し次第、Proが有効になります",
        });
        return;
      }
      if (code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
        showSnackbar({
          type: "info",
          message: "既に購入済みです。「購入を復元」をお試しください",
        });
        return;
      }
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_purchase" },
      });
      showSnackbar({
        type: "error",
        message: "購入に失敗しました。時間を置いて再度お試しください",
      });
      return;
    }

    // ここから先は Apple への課金が既に成功している。バックエンドへの同期失敗を
    // 「購入失敗」と誤表示すると二重購入を誘発するため、Sentry への記録に留めて
    // 成功画面へ進める（Pro 状態は webhook / 次回起動時の同期でも回復する）。
    try {
      await syncProStatus();
    } catch (error: unknown) {
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_purchase_sync" },
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    setPurchasing(false);
    onClose();
    router.push("/pro/success");
  };

  const handleRestore = async () => {
    // disabled プロパティだけに頼らず、連打による restorePurchases の多重起動を関数側でも防ぐ。
    if (restoringRef.current) return;
    setRestoring(true);
    let customerInfo;
    try {
      customerInfo = await restorePurchases();
    } catch {
      setRestoring(false);
      showSnackbar({
        type: "error",
        message: "復元に失敗しました。時間を置いて再度お試しください",
      });
      return;
    }

    // ここから先は RevenueCat 上の復元が既に成功している。purchase と同様、
    // バックエンドへの同期失敗を「復元失敗」と誤表示せず Sentry 記録に留める
    // （Pro 状態は webhook / 次回起動時の同期でも回復する）。
    try {
      await syncProStatus();
    } catch (error: unknown) {
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_restore_sync" },
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    setRestoring(false);

    // 復元対象が 0 件でも restorePurchases 自体は成功するため、
    // active な entitlement の有無で成功メッセージと出し分ける。
    const hasActiveEntitlement =
      Object.keys(customerInfo.entitlements.active).length > 0;
    if (hasActiveEntitlement) {
      showSnackbar({ type: "success", message: "購入情報を復元しました" });
      onClose();
    } else {
      showSnackbar({
        type: "info",
        message: "復元できる購入情報がありませんでした",
      });
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="ペイウォールを閉じる"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#F4F4F4" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <Text style={styles.brandName}>BUZZ BASE</Text>
              <View style={styles.brandProBadge}>
                <Text style={styles.brandProBadgeText}>PRO</Text>
              </View>
            </View>

            {contextMessage ? (
              <View style={styles.contextBanner}>
                <Ionicons name="information-circle" size={16} color="#D4D4D4" />
                <Text style={styles.contextBannerText}>{contextMessage}</Text>
              </View>
            ) : null}

            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>{copy.title}</Text>
              <Text style={styles.highlightDescription}>
                {copy.description}
              </Text>
            </View>

            <Text style={styles.subtitle}>
              すべての機能が使い放題になります
            </Text>
            <Text style={styles.sectionTitle}>PRO でできること</Text>
            <View style={styles.groupList}>
              {visibleGroups.map((group) => (
                <View key={group.title} style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Ionicons name={group.icon} size={16} color="#d08000" />
                    <Text style={styles.groupHeaderTitle}>{group.title}</Text>
                  </View>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      <View style={styles.tableLabelCell} />
                      <Text style={styles.tableHeaderFree}>無料</Text>
                      <Text style={styles.tableHeaderPro}>PRO</Text>
                    </View>
                    {group.keys.map((key, index) => (
                      <View
                        key={key}
                        style={[
                          styles.tableRow,
                          index === group.keys.length - 1 &&
                            styles.tableRowLast,
                        ]}
                        accessibilityLabel={`${PRO_PAYWALL_COPY[key].title}。無料は${FEATURE_COMPARISONS[key].free}、PROは${FEATURE_COMPARISONS[key].pro}`}
                      >
                        <Text style={styles.tableLabelCell} numberOfLines={2}>
                          {PRO_PAYWALL_COPY[key].title}
                        </Text>
                        <Text style={styles.tableFreeCell}>
                          {FEATURE_COMPARISONS[key].free}
                        </Text>
                        <Text style={styles.tableProCell}>
                          {FEATURE_COMPARISONS[key].pro}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>プランを選択</Text>
            {loadingOfferings ? (
              <ActivityIndicator
                size="small"
                color="#d08000"
                style={styles.plansLoading}
              />
            ) : packages.length > 0 ? (
              <View style={styles.planList}>
                {packages.map((pkg) => {
                  const label = PLAN_LABELS[pkg.packageType] ?? {
                    name: pkg.product.title,
                    period: "",
                  };
                  const isSelected = pkg.identifier === selectedPackageId;
                  const showSavingsBadge =
                    pkg.packageType === "ANNUAL" && annualIsDiscounted;
                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardSelected,
                      ]}
                      onPress={() => setSelectedPackageId(pkg.identifier)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${label.name} ${pkg.product.priceString}`}
                    >
                      <View style={styles.planRadioOuter}>
                        {isSelected && <View style={styles.planRadioInner} />}
                      </View>
                      <View style={styles.planNameRow}>
                        <Text style={styles.planName}>{label.name}</Text>
                        {showSavingsBadge && annualSavingsAmount != null ? (
                          <View style={styles.savingsBadge}>
                            <Text style={styles.savingsBadgeText}>
                              年間¥{annualSavingsAmount.toLocaleString()}お得
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.planPrice}>
                        {pkg.product.priceString}
                        {label.period}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                プラン情報を取得できませんでした。時間を置いて再度お試しください。
              </Text>
            )}

            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring}
              style={styles.restoreLink}
              accessibilityRole="button"
              accessibilityLabel="購入を復元"
            >
              <Text style={styles.restoreLinkText}>
                {restoring ? "復元中..." : "購入を復元"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              契約期間は開始日から月額・年額などプランの周期ごとに自動更新されます。解約は
              App Store / Google Play のサブスクリプション設定から行えます。
            </Text>

            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/terms-of-service");
                }}
                accessibilityRole="link"
                accessibilityLabel="利用規約"
              >
                <Text style={styles.legalLinkText}>利用規約</Text>
              </TouchableOpacity>
              <Text style={styles.legalLinkSeparator}>・</Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/privacy-policy");
                }}
                accessibilityRole="link"
                accessibilityLabel="プライバシーポリシー"
              >
                <Text style={styles.legalLinkText}>プライバシーポリシー</Text>
              </TouchableOpacity>
              <Text style={styles.legalLinkSeparator}>・</Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/tokushoho");
                }}
                accessibilityRole="link"
                accessibilityLabel="特定商取引法に基づく表記"
              >
                <Text style={styles.legalLinkText}>
                  特定商取引法に基づく表記
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.trialNotice}>
              7 日間の無料トライアル期間中に解約すれば料金はかかりません
            </Text>
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={!selectedPackage || purchasing}
              style={[
                styles.ctaButton,
                (!selectedPackage || purchasing) && styles.ctaButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="PROを始める"
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#F4F4F4" />
              ) : (
                <Text style={styles.ctaButtonText}>PROを始める</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#2E2E2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  brandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  brandName: {
    color: "#F4F4F4",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  brandProBadge: {
    backgroundColor: "#d08000",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  brandProBadgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    alignSelf: "flex-start",
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  contextBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  contextBannerText: {
    flex: 1,
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 18,
  },
  highlightCard: {
    width: "100%",
    backgroundColor: "rgba(208, 128, 0, 0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(208, 128, 0, 0.4)",
    padding: 16,
    marginBottom: 20,
  },
  highlightTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  highlightDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  groupList: {
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  group: {
    width: "100%",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  groupHeaderTitle: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  table: {
    width: "100%",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#4A4A4A",
  },
  tableHeaderFree: {
    flex: 0.65,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
  },
  tableHeaderPro: {
    flex: 0.75,
    textAlign: "center",
    color: "#d08000",
    fontSize: 11,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableLabelCell: {
    flex: 1.6,
    color: "#D4D4D4",
    fontSize: 13,
    paddingRight: 6,
  },
  tableFreeCell: {
    flex: 0.65,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 13,
  },
  tableProCell: {
    flex: 0.75,
    textAlign: "center",
    color: "#d08000",
    fontSize: 13.5,
    fontWeight: "700",
  },
  plansLoading: {
    marginBottom: 20,
  },
  planList: {
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#424242",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    padding: 14,
  },
  planCardSelected: {
    borderColor: "#d08000",
    backgroundColor: "rgba(208, 128, 0, 0.1)",
  },
  planRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d08000",
  },
  planNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  planName: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  savingsBadge: {
    backgroundColor: "#d08000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  savingsBadgeText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  planPrice: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  restoreLink: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  restoreLinkText: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  disclaimer: {
    color: "#7A7A7A",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  legalLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  legalLinkText: {
    color: "#d08000",
    fontSize: 11,
    textDecorationLine: "underline",
  },
  legalLinkSeparator: {
    color: "#7A7A7A",
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#424242",
  },
  trialNotice: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
});
