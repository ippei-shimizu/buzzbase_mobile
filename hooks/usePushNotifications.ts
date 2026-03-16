import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import {
  registerForPushNotifications,
  registerDeviceToken,
} from "@services/pushNotificationService";

export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

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
