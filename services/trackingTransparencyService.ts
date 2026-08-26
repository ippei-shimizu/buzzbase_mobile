import * as TrackingTransparency from "expo-tracking-transparency";
import { AppState, type AppStateStatus, Platform } from "react-native";

/**
 * active になるのを待つ上限。これを過ぎたら待たずにリクエストする。
 * 起動直後の currentState は "active" 相当でも未確定値を返すことがあり、その場合
 * change イベントも発生しないため、待ち続けると ATT が一度も要求されなくなる。
 * 表示されなかった場合も status は undetermined のままなので次回起動で再試行される。
 */
export const ACTIVE_WAIT_TIMEOUT_MS = 3_000;

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

    let settled = false;
    let subscription: { remove: () => void } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      subscription?.remove();
      resolve();
    };

    timer = setTimeout(finish, ACTIVE_WAIT_TIMEOUT_MS);
    subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") finish();
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
