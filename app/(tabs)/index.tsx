import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationBell } from "@components/dashboard/NotificationBell";
import { ActivityView } from "@components/home/ActivityView";
import { DashboardView } from "@components/home/DashboardView";
import {
  GlobalMenuButton,
  GlobalMenuOverlay,
  useGlobalMenu,
} from "@components/ui/GlobalMenu";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useNotificationCount } from "@hooks/useNotifications";

const SEGMENTS = ["活動", "ダッシュボード"];

/**
 * ホームタブ。`[活動] ⇄ [ダッシュボード]` のセグメントで2面を切り替える。
 * デフォルトは「活動」面（毎日の継続ループの司令塔）。
 */
export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { count } = useNotificationCount();
  const { menuVisible, menuOpacity, openMenu, closeMenu } = useGlobalMenu();
  const [activeSegment, setActiveSegment] = useState(0);

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
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          options={SEGMENTS}
          selectedIndex={activeSegment}
          onSelect={setActiveSegment}
        />
      </View>
      {activeSegment === 0 ? <ActivityView /> : <DashboardView />}
      <GlobalMenuOverlay
        visible={menuVisible}
        opacity={menuOpacity}
        onClose={closeMenu}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
