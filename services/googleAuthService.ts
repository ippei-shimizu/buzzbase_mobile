import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import axiosInstance from "@utils/axiosInstance";
import * as SecureStore from "expo-secure-store";

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
};

export const googleSignIn = async () => {
  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices();
  }
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) throw new Error("Google IDトークンの取得に失敗しました");

  const apiResponse = await axiosInstance.post("/google_sign_in", {
    id_token: idToken,
  });

  const headers = apiResponse.headers as Record<string, string>;
  if (headers["access-token"]) {
    await SecureStore.setItemAsync("access-token", headers["access-token"]);
    await SecureStore.setItemAsync("client", headers["client"]);
    await SecureStore.setItemAsync("uid", headers["uid"]);
  }

  return apiResponse.data;
};
