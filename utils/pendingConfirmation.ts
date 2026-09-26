import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";

/**
 * メール確認待ちのメールアドレスを端末に控えるためのラッパ。
 *
 * `buzzbase://` はカスタムスキームなので Web ページ・他アプリ・QR コードなど誰でも発火できる。
 * 確認リンクで受け取った uid がこの値と一致する場合だけ自動ログインを許可することで、
 * 第三者が用意したトークン付きリンクで別アカウントにログインさせられるのを防ぐ。
 *
 * authTokenStorage と同じく、読み書きの失敗は呼び出し元へ伝播させず Sentry に記録する。
 */

const PENDING_CONFIRMATION_UID_KEY = "pending_confirmation_uid";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

/**
 * 確認待ちのメールアドレスを保存する。
 *
 * @param uid サインアップ / 確認メール再送で指定したメールアドレス
 */
export const setPendingConfirmationUid = async (uid: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      PENDING_CONFIRMATION_UID_KEY,
      uid,
      SECURE_STORE_OPTIONS,
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "pendingConfirmation", op: "set" },
    });
  }
};

/**
 * 確認待ちのメールアドレスを取得する。
 *
 * @return 保存済みのメールアドレス。未保存または読み取り失敗時は `null`
 */
export const getPendingConfirmationUid = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PENDING_CONFIRMATION_UID_KEY);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "pendingConfirmation", op: "get" },
    });
    return null;
  }
};

/** 確認待ちのメールアドレスを破棄する。自動ログインが成立した後に呼ぶ。 */
export const clearPendingConfirmationUid = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(PENDING_CONFIRMATION_UID_KEY);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "pendingConfirmation", op: "delete" },
    });
  }
};
