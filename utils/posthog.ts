import PostHog from "posthog-react-native";

/**
 * PostHog プロダクト分析クライアント（シングルトン）。
 *
 * identify / reset / capture は React コンポーネントでない service モジュール
 * （authService 等）からも呼ぶため、usePostHog フックではなくモジュール
 * シングルトンとして公開する。呼び出し側は `posthog?.xxx()` で null 安全に扱う。
 *
 * 開発ビルド（__DEV__）と API キー未設定時は計測を無効化し null を返す
 * （Sentry の `enabled: !__DEV__` と方針を揃え、開発イベントで無料枠を消費しない）。
 */
const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export const isPostHogEnabled = !__DEV__ && !!apiKey;

export const posthog = isPostHogEnabled
  ? new PostHog(apiKey as string, {
      host,
      captureAppLifecycleEvents: true,
    })
  : null;
