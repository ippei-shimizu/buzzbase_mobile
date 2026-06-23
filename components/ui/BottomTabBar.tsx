import { useRouter, usePathname } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BOTTOM_TAB_ITEMS } from "@components/ui/bottomTabItems";

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
      {BOTTOM_TAB_ITEMS.map((tab) => {
        const isActive = pathname.startsWith(tab.href.replace("/(tabs)", ""));
        const color = isActive ? "#d08000" : "#A1A1AA";
        const Icon = tab.Icon;

        return (
          <TouchableOpacity
            key={tab.name}
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
