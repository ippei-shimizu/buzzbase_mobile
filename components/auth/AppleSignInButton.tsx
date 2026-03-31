import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

function AppleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.65-2.2.46-3.06-.4C3.79 16.17 4.36 9.53 8.7 9.29c1.25.07 2.12.72 2.88.76.91-.19 1.78-.87 2.77-.79 1.18.1 2.07.58 2.65 1.49-2.43 1.46-1.85 4.67.39 5.57-.46 1.21-1.06 2.41-2.34 3.97zM12.03 9.25C11.88 7.15 13.58 5.4 15.57 5.25c.3 2.38-2.17 4.16-3.54 4z" />
    </Svg>
  );
}

export function AppleSignInButton({
  onPress,
  loading = false,
  label = "Appleでログイン",
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 12,
        opacity: loading ? 0.6 : 1,
      }}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <AppleLogo />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
