import { Platform } from "react-native";
import Constants from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";
import axiosInstance from "@utils/axiosInstance";
import * as SecureStore from "expo-secure-store";

const isExpoGo = Constants.appOwnership === "expo";

export const appleSignIn = async () => {
  if (isExpoGo) {
    throw new Error(
      "Apple認証はExpo Goでは利用できません。Development Buildを使用してください。",
    );
  }
  if (Platform.OS !== "ios") {
    throw new Error("Apple認証はiOSでのみ利用可能です");
  }

  let credential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "ERR_REQUEST_CANCELED"
    ) {
      return null;
    }
    throw error;
  }

  const identityToken = credential.identityToken;
  if (!identityToken) throw new Error("Apple IDトークンの取得に失敗しました");

  const fullName =
    credential.fullName?.givenName || credential.fullName?.familyName
      ? {
          given_name: credential.fullName.givenName || "",
          family_name: credential.fullName.familyName || "",
        }
      : undefined;

  const apiResponse = await axiosInstance.post("/apple_sign_in", {
    identity_token: identityToken,
    full_name: fullName,
  });

  const headers = apiResponse.headers as Record<string, string>;
  if (headers["access-token"]) {
    await SecureStore.setItemAsync("access-token", headers["access-token"]);
    await SecureStore.setItemAsync("client", headers["client"]);
    await SecureStore.setItemAsync("uid", headers["uid"]);
  }

  return apiResponse.data;
};
