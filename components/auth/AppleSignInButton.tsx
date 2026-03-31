import { Platform } from "react-native";

interface Props {
  onPress: () => void;
}

export function AppleSignInButton({ onPress }: Props) {
  if (Platform.OS !== "ios") return null;

  const AppleAuthentication = require("expo-apple-authentication");

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{ width: "100%", height: 44, marginTop: 12 }}
      onPress={onPress}
    />
  );
}
