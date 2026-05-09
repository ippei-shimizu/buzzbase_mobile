import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axiosInstance from "@utils/axiosInstance";

const isExpoGo = Constants.appOwnership === "expo";

export const configureGoogleSignIn = () => {
  if (isExpoGo) return;
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
};

export const googleSignIn = async () => {
  if (isExpoGo) {
    throw new Error(
      "Google認証はExpo Goでは利用できません。Development Buildを使用してください。",
    );
  }
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices();
  }
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) throw new Error("Google IDトークンの取得に失敗しました");

  // トークンはレスポンスヘッダー経由でaxiosInstanceのレスポンスインターセプタが保存する
  const apiResponse = await axiosInstance.post("/google_sign_in", {
    id_token: idToken,
  });

  const userId = apiResponse.data?.data?.id;
  if (userId) Sentry.setUser({ id: String(userId) });

  return apiResponse.data;
};
