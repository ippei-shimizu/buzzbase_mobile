import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import {
  registerForPushNotifications,
  registerDeviceToken,
} from "@services/pushNotificationService";

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
