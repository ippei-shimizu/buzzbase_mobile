import { Platform } from "react-native";

const getDevApiUrl = (): string => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3100";
  }
  return "http://localhost:3100";
};

export const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : process.env.EXPO_PUBLIC_API_URL || "";

export const API_V1_URL = `${API_BASE_URL}/api/v1`;
