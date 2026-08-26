import * as TrackingTransparency from "expo-tracking-transparency";
import { AppState, type AppStateStatus, Platform } from "react-native";

/**
 * アプリが active になるまで待つ。ATT ダイアログは active 状態でしか表示されず、
 * 未 active のまま要求すると OS に黙って無視されるため。
 */
const waitUntilActive = (): Promise<void> =>
  new Promise((resolve) => {
    if (AppState.currentState === "active") {
      resolve();
      return;
    }
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState !== "active") return;
        subscription.remove();
        resolve();
      },
    );
  });

/**
 * ATT(App Tracking Transparency)の許可ダイアログを表示する。
 * 「1インストールにつき1回」は OS 側が保証しているため、アプリ側で表示済みフラグは持たない。
 * SecureStore(Keychain)はアプリ削除後も値が残り、再インストールしても二度と表示できなくなる。
 * Android には存在しない概念のため何もしない。
 */
export const requestTrackingPermissionOnce = async (): Promise<void> => {
  if (Platform.OS !== "ios") return;
  if (!TrackingTransparency.isAvailable()) return;

  const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
  if (status !== "undetermined") return;

  await waitUntilActive();
  await TrackingTransparency.requestTrackingPermissionsAsync();
};
