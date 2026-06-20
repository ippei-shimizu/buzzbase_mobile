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
      // アプリ起動/フォアグラウンド復帰の計測（リテンション分析に使用）。
      // autocapture の captureScreens/captureTouches とは別軸で、画面遷移と
      // タッチの自動取得は PostHogProvider 側で無効化している。
      captureAppLifecycleEvents: true,
      // Session Replay。PostHog の Project Settings で「Record user sessions」
      // を有効化しないと録画されない点に注意。
      enableSessionReplay: true,
      // アプリ再起動をまたいでセッションを継続する。
      enablePersistSessionIdAcrossRestart: true,
      sessionReplayConfig: {
        // 中高生ユーザーの PII 保護のため入力・画像・システムビューを全マスク
        // （SDK 既定値だが意図を明示）。
        maskAllTextInputs: true,
        maskAllImages: true,
        maskAllSandboxedViews: true,
        // 無料枠（モバイル 2,500 録画/月）内に収めるため 10% サンプリング。
        sampleRate: 0.1,
      },
    })
  : null;
