import * as Sentry from "@sentry/react-native";
import { Linking, Platform } from "react-native";

/**
 * X (Twitter) のホスト名にマッチするか判定する。
 * `x.com`, `twitter.com`, `www.*`, `mobile.*`, `m.*` を受け付ける。
 */
const X_HOST_PATTERN = /^(?:www\.|mobile\.|m\.)?(?:x|twitter)\.com$/i;

/**
 * 単独ユーザー名として扱わない予約パス。
 * Xはユーザー名と機能ページが同じ `/<name>` 形式で衝突するため、
 * これらにマッチした場合はアプリスキーム変換しない。
 */
const RESERVED_PATHS = new Set([
  "home",
  "explore",
  "notifications",
  "messages",
  "search",
  "compose",
  "i",
  "intent",
  "settings",
  "login",
  "signup",
  "account",
  "tos",
  "privacy",
  "about",
  "download",
  "hashtag",
  "share",
]);

/**
 * X / Twitter の Web URL を、Xアプリで開くためのカスタムスキームURLに変換する。
 * 対応外のURL（X以外のドメイン、予約パス、不正URL等）は null を返す。
 *
 * @example
 * resolveXAppUrl("https://x.com/foo") // => "twitter://user?screen_name=foo"
 * resolveXAppUrl("https://x.com/foo/status/123") // => "twitter://status?id=123"
 * resolveXAppUrl("https://x.com/home") // => null
 * resolveXAppUrl("https://example.com") // => null
 */
export function resolveXAppUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  if (!X_HOST_PATTERN.test(parsed.hostname)) {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  // `https://x.com/@foo` のような @ プレフィックスは剥がしてからユーザー名扱いする
  const username = segments[0].replace(/^@+/, "");
  if (!username || RESERVED_PATHS.has(username.toLowerCase())) {
    return null;
  }

  // /<user>/status/<id> または /<user>/statuses/<id>
  if (
    segments.length >= 3 &&
    (segments[1] === "status" || segments[1] === "statuses") &&
    /^\d+$/.test(segments[2])
  ) {
    return `twitter://status?id=${segments[2]}`;
  }

  // /<user> または /<user>/ のみ（プロフィール）
  if (segments.length === 1) {
    return `twitter://user?screen_name=${username}`;
  }

  return null;
}

/**
 * 外部URLを開く。X (Twitter) URLはアプリで開くことを優先し、
 * 失敗時は元の https URL でフォールバックする。
 *
 * iOS: `LSApplicationQueriesSchemes` に登録済みのスキームのみ
 *      `canOpenURL` で判定できるため、これを前提にcanOpenURLで分岐する。
 * Android: API 30+ の `<queries>` 制限を避けるため `canOpenURL` を使わず、
 *          直接 `openURL(scheme)` を試して reject されたら https URLにフォールバック。
 *
 * @param url 開きたい外部URL
 * @param options.source Sentry通知のタグに付与する呼び出し元識別子
 */
export function openExternalUrlPreferringNativeApp(
  url: string,
  options: { source: string },
): void {
  const appUrl = resolveXAppUrl(url);
  const { source } = options;

  if (!appUrl) {
    openHttpsDirectly(url, source);
    return;
  }

  if (Platform.OS === "ios") {
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(appUrl).catch((error) =>
            handleAppSchemeFailure(error, url, appUrl, source),
          );
        } else {
          openHttpsDirectly(url, source);
        }
      })
      .catch((error) => handleAppSchemeFailure(error, url, appUrl, source));
    return;
  }

  // Android: canOpenURL が <queries> 未設定時に false を返すため使わない。
  // 直接 openURL を試し、失敗時にのみ https URL にフォールバックする。
  Linking.openURL(appUrl).catch((error) =>
    handleAppSchemeFailure(error, url, appUrl, source),
  );
}

/**
 * https URL を直接開く。失敗時はSentryに通知するだけで再試行はしない。
 */
function openHttpsDirectly(url: string, source: string): void {
  Linking.openURL(url).catch((error) => {
    Sentry.captureException(error, {
      tags: { source, action: "open-external-url" },
      extra: { url },
    });
  });
}

/**
 * Xアプリスキームでの起動失敗時の処理。Sentry通知後にhttpsへフォールバックする。
 * https側も失敗した場合はさらにSentry通知する（再試行はしない）。
 */
function handleAppSchemeFailure(
  error: unknown,
  url: string,
  appUrl: string,
  source: string,
): void {
  Sentry.captureException(error, {
    tags: { source, action: "open-x-app-url" },
    extra: { url, appUrl },
  });
  Linking.openURL(url).catch((fallbackError) => {
    Sentry.captureException(fallbackError, {
      tags: { source, action: "open-external-url-fallback" },
      extra: { url },
    });
  });
}
