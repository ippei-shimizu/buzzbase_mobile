/**
 * App Store / Google Play Store の識別子と URL 定数。
 *
 * iOS の Apple ID は App Store Connect の数値ID。
 * Android Package は `app.json` の `expo.android.package` と一致させる。
 *
 * `IOS_REVIEW_URL` にクエリ `?action=write-review` を付けると
 * App Store の「レビューを書く」画面へ直接遷移する。
 */
export const IOS_APPLE_ID = "6761011816";
export const IOS_REVIEW_URL = `itms-apps://itunes.apple.com/app/id${IOS_APPLE_ID}`;
export const IOS_APP_STORE_URL = `https://apps.apple.com/app/id${IOS_APPLE_ID}`;

export const ANDROID_PACKAGE = "jp.buzzbase.mobile";
export const ANDROID_STORE_URL = `market://details?id=${ANDROID_PACKAGE}`;
export const ANDROID_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
