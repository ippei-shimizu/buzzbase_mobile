import * as SecureStore from "expo-secure-store";
import * as TrackingTransparency from "expo-tracking-transparency";
import { Platform } from "react-native";

const REQUESTED_KEY = "att_permission_requested";

/**
 * ATT(App Tracking Transparency)ダイアログを1インストールにつき1回だけ表示する。
 * iOSはOS側の制約で確認ダイアログを複数回出せないため、リクエスト実行済みかどうかを
 * 端末に記録し、許可/拒否いずれの結果でも再表示はしない。Androidには存在しない概念のため何もしない。
 */
export const requestTrackingPermissionOnce = async (): Promise<void> => {
  if (Platform.OS !== "ios") return;
  const alreadyRequested = await SecureStore.getItemAsync(REQUESTED_KEY);
  if (alreadyRequested) return;

  await SecureStore.setItemAsync(REQUESTED_KEY, "1");
  await TrackingTransparency.requestTrackingPermissionsAsync();
};
