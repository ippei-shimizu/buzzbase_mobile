import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeIcon } from "@components/icon/HomeIcon";
import { BallIcon } from "@components/icon/BallIcon";
import { GroupIcon } from "@components/icon/GroupIcon";
import { UserIcon } from "@components/icon/UserIcon";

const TABS = [
  {
    label: "ダッシュボード",
    href: "/(tabs)" as const,
    icon: HomeIcon,
  },
  {
    label: "試合結果",
    href: "/(tabs)/(game-results)" as const,
    icon: BallIcon,
  },
  {
    label: "グループ",
    href: "/(tabs)/(groups)" as const,
    icon: GroupIcon,
  },
  {
    label: "マイページ",
    href: "/(tabs)/(profile)" as const,
    icon: UserIcon,
  },
];

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#2E2E2E",
        borderTopWidth: 1,
        borderTopColor: "#424242",
        paddingBottom: insets.bottom,
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href.replace("/(tabs)", ""));
        const color = isActive ? "#d08000" : "#A1A1AA";
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => router.replace(tab.href)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Icon size={22} color={color} />
            <Text style={{ fontSize: 10, color, marginTop: 2 }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
