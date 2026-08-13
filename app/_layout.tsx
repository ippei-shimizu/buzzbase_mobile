import "../global.css";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { useCallback, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { ScheduleReminderSync } from "@components/schedule/ScheduleReminderSync";
import { Snackbar } from "@components/ui/Snackbar";
import {
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
} from "@constants/revenueCat";
import { usePushNotifications } from "@hooks/usePushNotifications";
import { useStoreReview } from "@hooks/useStoreReview";
import { configureGoogleSignIn } from "@services/googleAuthService";
import {
  addCustomerInfoUpdateListener,
  configureRevenueCat,
} from "@services/revenueCatService";
import { useAuthStore } from "@stores/authStore";
import { posthog } from "@utils/posthog";
import { queryClient } from "@utils/queryClient";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,
  environment:
    process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production"),
  release: Constants.expoConfig?.version,
  tracesSampleRate: 0.1,
  // App Hang などメインスレッドブロック解析用。tracesSampleRate でサンプリングされた
  // trace に対してのみ profile を取るため、全体の負荷増は tracesSampleRate に律速される。
  profilesSampleRate: 1.0,
  sendDefaultPii: false,
});

// アプリ起動時とディープリンク時のアンカー（初期ルート）をホーム（タブ）に固定する。
// これが無いと、開発時のナビゲーション状態復元などでホーム以外の画面が最初に開くことがある。
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

configureGoogleSignIn();

const revenueCatApiKey =
  Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
if (revenueCatApiKey) configureRevenueCat(revenueCatApiKey);

/**
 * Expo Router の現在パスを PostHog の $screen イベントとして送信する。
 * Expo Router は NavigationContainer を公開せず autocapture の captureScreens が
 * 使えないため、usePathname を監視して手動送信する。
 */
function ScreenTracker() {
  const pathname = usePathname();

  useEffect(() => {
    posthog?.screen(pathname);
  }, [pathname]);

  return null;
}

function RootLayoutInner() {
  usePushNotifications();
  const router = useRouter();
  const { initInstallDate, initPositiveEventCount } = useStoreReview();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const handleDeepLink = useCallback(
    (url: string) => {
      const parsed = Linking.parse(url);
      if (
        parsed.hostname === "confirmation-success" ||
        parsed.path === "confirmation-success"
      ) {
        const success = parsed.queryParams?.account_confirmation_success;
        if (success === "true") {
          Alert.alert(
            "メール認証完了",
            "メールアドレスの認証が完了しました。ログインしてください。",
            [{ text: "OK", onPress: () => router.replace("/(auth)/sign-in") }],
          );
        } else {
          router.replace("/(auth)/sign-in");
        }
        return;
      }

      if (
        parsed.hostname === "reset-password" ||
        parsed.path === "reset-password"
      ) {
        const {
          "access-token": accessToken,
          client,
          uid,
        } = parsed.queryParams ?? {};
        if (
          typeof accessToken === "string" &&
          typeof client === "string" &&
          typeof uid === "string"
        ) {
          router.push({
            pathname: "/(auth)/reset-password",
            params: { accessToken, client, uid },
          });
        } else {
          router.replace("/(auth)/sign-in");
        }
      }
    },
    [router],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  useEffect(() => {
    initInstallDate();
    initPositiveEventCount();
  }, [initInstallDate, initPositiveEventCount]);

  // RevenueCat 側の顧客情報更新（更新・解約・返金・別端末購入など）を検知して
  // Pro 状態のキャッシュを無効化し、アプリ内購入フローを経由しない変化を反映する。
  useEffect(() => {
    const unsubscribe = addCustomerInfoUpdateListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <ScreenTracker />
      {isLoggedIn ? <ScheduleReminderSync /> : null}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          contentStyle: { backgroundColor: "#2E2E2E" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(game-record)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(practice-record)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(shadow-swing)" options={{ headerShown: false }} />
        <Stack.Screen name="(schedule)" options={{ headerShown: false }} />
        <Stack.Screen name="(menu-set)" options={{ headerShown: false }} />
        <Stack.Screen name="(practice-menu)" options={{ headerShown: false }} />
        <Stack.Screen name="(goal)" options={{ headerShown: false }} />
        <Stack.Screen name="(note)" options={{ headerShown: false }} />
        <Stack.Screen name="(records)" options={{ headerShown: false }} />
        <Stack.Screen name="(theme)" options={{ headerShown: false }} />
        <Stack.Screen name="(insight)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(reflect-template)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(review)" options={{ headerShown: false }} />
        <Stack.Screen name="(season)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen
          name="game-result-detail"
          options={{ title: "試合詳細", headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="group-detail"
          options={{ headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "設定", headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{ title: "プライバシーポリシー", headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{ title: "利用規約", headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="tokushoho"
          options={{
            title: "特定商取引法に基づく表記",
            headerBackTitle: "戻る",
          }}
        />
        <Stack.Screen
          name="licenses"
          options={{
            title: "ライセンス表記",
            headerBackTitle: "戻る",
          }}
        />
        <Stack.Screen
          name="pro"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="account/subscription/index"
          options={{ title: "サブスクリプション管理", headerBackTitle: "戻る" }}
        />
      </Stack>
      <Snackbar />
    </>
  );
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {posthog ? (
        <PostHogProvider
          client={posthog}
          autocapture={{ captureScreens: false, captureTouches: false }}
        >
          <RootLayoutInner />
        </PostHogProvider>
      ) : (
        <RootLayoutInner />
      )}
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
