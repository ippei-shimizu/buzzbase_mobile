import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBannerAd } from "@components/ads/AppBannerAd";
import { NotificationBell } from "@components/dashboard/NotificationBell";
import { AchievementSummaryModal } from "@components/goal/AchievementSummaryModal";
import { ActivityView } from "@components/home/ActivityView";
import { DashboardView } from "@components/home/DashboardView";
import {
  GlobalMenuButton,
  GlobalMenuOverlay,
  useGlobalMenu,
} from "@components/ui/GlobalMenu";
import { SwipeableTabPages } from "@components/ui/SwipeableTabPages";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { useNotificationCount } from "@hooks/useNotifications";

type HomeTab = "activity" | "dashboard";

const TABS: { key: HomeTab; label: string }[] = [
  { key: "activity", label: "練習・活動" },
  { key: "dashboard", label: "ダッシュボード" },
];
const TAB_KEYS = TABS.map((item) => item.key);
const TAB_LABELS = TABS.map((item) => item.label);

/**
 * ホームタブ。`[活動] ⇄ [ダッシュボード]` のセグメントで2面を切り替える。
 * デフォルトは「活動」面（毎日の継続ループの司令塔）。
 */
export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { count } = useNotificationCount();
  const { menuVisible, menuOpacity, openMenu, closeMenu } = useGlobalMenu();
  const [tab, setTab] = useState<HomeTab>("activity");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <NotificationBell
            count={count}
            onPress={() => router.push("/notifications")}
          />
          <GlobalMenuButton onPress={openMenu} />
        </View>
      ),
      headerRightContainerStyle: { paddingRight: 16 },
    });
  }, [navigation, count, router, openMenu]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <UnderlineTabBar
        options={TAB_LABELS}
        selectedIndex={TAB_KEYS.indexOf(tab)}
        onSelect={(index) => setTab(TAB_KEYS[index])}
      />
      <SwipeableTabPages
        tabKeys={TAB_KEYS}
        activeKey={tab}
        onChange={setTab}
        renderPage={(key) =>
          key === "activity" ? (
            <ActivityView isActive={tab === "activity"} />
          ) : (
            <DashboardView isActive={tab === "dashboard"} />
          )
        }
      />
      <AppBannerAd />
      <GlobalMenuOverlay
        visible={menuVisible}
        opacity={menuOpacity}
        onClose={closeMenu}
      />
      <AchievementSummaryModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
