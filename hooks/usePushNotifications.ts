import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
  registerForPushNotifications,
  registerDeviceToken,
} from "@services/pushNotificationService";
import { useAuthStore } from "../stores/authStore";

const isExpoGo = Constants.appOwnership === "expo";

export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!isLoggedIn || isExpoGo) return;

    const Notifications = require("expo-notifications");

    registerForPushNotifications().then((token) => {
      if (token) registerDeviceToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // バックグラウンド/ロック中はSecureStore読込が失敗し得るので
        // ここでのAPI再取得はスキップし、フォアグラウンド復帰後の再フェッチに任せる
        if (AppState.currentState !== "active") return;
        queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        router.push("/(tabs)/(notifications)");
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoggedIn, queryClient, router]);
}
