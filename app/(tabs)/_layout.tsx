import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  BillingIssueAlert,
  shouldShowBillingIssueAlert,
} from "@components/pro/BillingIssueAlert";
import {
  shouldShowTrialExpiringBanner,
  TrialExpiringBanner,
} from "@components/pro/TrialExpiringBanner";
import { BOTTOM_TAB_ITEMS } from "@components/ui/bottomTabItems";
import { useAuth } from "@hooks/useAuth";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useGroups } from "@hooks/useGroups";
import { useGroupTabBadge } from "@hooks/useGroupTabBadge";
import { useOnboarding } from "@hooks/useOnboarding";
import { useProStatus } from "@hooks/useProStatus";
import { useTrialBannerDismissed } from "@hooks/useTrialBannerDismissed";
import { trackAppLaunchForAds } from "@services/interstitialAdService";
import { shouldResetTabStack } from "@utils/tabStackReset";

export default function TabLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { enabled: proFeatures } = useFeatureFlag("pro_features");
  // pro_features=false の環境では Banner/Alert を一切表示しないため、/pro/status も叩かない。
  const { proStatus } = useProStatus({ enabled: proFeatures });
  const { isCompleted: isOnboardingCompleted } = useOnboarding();
  const { groups, isFetched: isGroupsFetched } = useGroups({
    enabled: isLoggedIn === true,
  });
  const { seen: isGroupBadgeSeen, markSeen: markGroupBadgeSeen } =
    useGroupTabBadge();
  const { dismissed: isTrialBannerDismissed, dismiss: dismissTrialBanner } =
    useTrialBannerDismissed(proStatus.subscription.expires_at);
  const insets = useSafeAreaInsets();

  // 広告の猶予期間判定に使う起動回数は、タブ画面(ログイン済み)到達時にだけ数える。
  useEffect(() => {
    if (isLoggedIn !== true) return;
    void trackAppLaunchForAds();
  }, [isLoggedIn]);

  // 取得確定後に未参加（グループ0件）かつ未閲覧のときだけグループタブに赤ポチを出す。
  // isGroupsFetched でフェッチ開始前の一瞬の誤点灯を防ぐ。
  const showGroupBadge =
    isLoggedIn === true &&
    isGroupsFetched &&
    groups.length === 0 &&
    isGroupBadgeSeen === false;

  // バナーは Tabs の外側に描画され、自前で上部インセットを確保する。React Navigation の
  // ヘッダーは兄弟要素を知らず insets.top を必ず加算するため、バナー表示中は Tabs 配下に
  // top: 0 を渡してインセットの二重確保を防ぐ。
  const hasTopBanner =
    proFeatures === true &&
    (shouldShowBillingIssueAlert(proStatus.subscription) ||
      shouldShowTrialExpiringBanner(
        proStatus.subscription,
        isTrialBannerDismissed,
      ));

  const isResolvingAuth = isLoading || isLoggedIn === undefined;
  // ログイン済みユーザーにはオンボーディングを出さないため、未ログイン時のみ
  // 完了フラグの確定を待つ。
  const isResolvingOnboarding = !isLoggedIn && isOnboardingCompleted === null;

  if (isResolvingAuth || isResolvingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2E2E2E",
        }}
      >
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!isLoggedIn) {
    // 新規ダウンロードの未ログインユーザーにのみ初回オンボーディングを表示する
    if (!isOnboardingCompleted) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      {proFeatures ? (
        <>
          <BillingIssueAlert subscription={proStatus.subscription} />
          <TrialExpiringBanner
            subscription={proStatus.subscription}
            dismissed={isTrialBannerDismissed}
            onDismiss={dismissTrialBanner}
          />
        </>
      ) : null}
      <SafeAreaInsetsContext.Provider
        value={hasTopBanner ? { ...insets, top: 0 } : insets}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#d08000",
            tabBarInactiveTintColor: "#A1A1AA",
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              backgroundColor: "#2E2E2E",
              borderTopColor: "#424242",
            },
            headerStyle: { backgroundColor: "#2E2E2E" },
            headerTintColor: "#F4F4F4",
          }}
        >
          {BOTTOM_TAB_ITEMS.map((tab) => {
            const Icon = tab.Icon;
            const isGroupRoute = tab.name === "(groups)";
            // カッコ付きグループ route 配下に積まれたスタックは、再タップで先頭(index)へ戻す。
            // ルートStack（設定画面・Paywall の規約リンク等）から直接 push された画面は
            // そのタブのスタックに index を挟まず先頭に載るため、index を持たない場合も
            // リセット対象に含める（含めないとタブを押しても何も起きず戻れなくなる）。
            const needsStackReset =
              tab.name === "(game-results)" ||
              tab.name === "(profile)" ||
              isGroupRoute;
            return (
              <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{
                  title: tab.label,
                  // カッコ付きグループ route はネスト Stack 側で独自ヘッダを持つため親タブのヘッダは隠す
                  headerShown: !tab.name.startsWith("("),
                  tabBarIcon: ({ color, size }) => (
                    <Icon
                      size={size}
                      color={color}
                      showBadge={isGroupRoute ? showGroupBadge : undefined}
                    />
                  ),
                }}
                listeners={
                  needsStackReset
                    ? ({ navigation }) => ({
                        tabPress: (e) => {
                          if (isGroupRoute) markGroupBadgeSeen();
                          const state = navigation.getState();
                          const route = state.routes.find(
                            (r: { name: string }) => r.name === tab.name,
                          );
                          if (!shouldResetTabStack(route?.state)) return;
                          e.preventDefault();
                          navigation.navigate(tab.name, { screen: "index" });
                        },
                      })
                    : undefined
                }
              />
            );
          })}
        </Tabs>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}
