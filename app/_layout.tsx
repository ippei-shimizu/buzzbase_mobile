import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { usePushNotifications } from "@hooks/usePushNotifications";
import { useStoreReview } from "@hooks/useStoreReview";
import { configureGoogleSignIn } from "@services/googleAuthService";
import { queryClient } from "@utils/queryClient";

configureGoogleSignIn();

function RootLayoutInner() {
  usePushNotifications();
  const router = useRouter();
  const { initInstallDate } = useStoreReview();

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
  }, [initInstallDate]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2E2E2E" },
          headerTintColor: "#F4F4F4",
          contentStyle: { backgroundColor: "#2E2E2E" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(game-record)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game-result-detail"
          options={{ title: "試合詳細", headerBackTitle: "戻る" }}
        />
        <Stack.Screen
          name="group-detail"
          options={{ headerBackTitle: "戻る" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutInner />
    </QueryClientProvider>
  );
}
