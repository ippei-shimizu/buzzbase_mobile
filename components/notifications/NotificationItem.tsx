import type {
  NotificationItem as NotificationItemType,
  UserNotification,
  ManagementNotification,
} from "../../types/notification";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";
import {
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from "@hooks/useRelationship";
import { deleteNotification } from "@services/notificationService";

interface NotificationItemProps {
  notification: NotificationItemType;
  onPress: (notification: NotificationItemType) => void;
}

const isUserNotification = (
  notification: NotificationItemType,
): notification is UserNotification => {
  return notification.event_type !== "management_notice";
};

const getIconName = (
  eventType: NotificationItemType["event_type"],
): keyof typeof Ionicons.glyphMap => {
  switch (eventType) {
    case "followed":
    case "follow_request":
      return "person-add";
    case "follow_request_accepted":
      return "checkmark-circle";
    case "group_invitation":
      return "people";
    case "management_notice":
      return "megaphone";
  }
};

const getNotificationText = (notification: NotificationItemType): string => {
  if (!isUserNotification(notification)) {
    return (notification as ManagementNotification).title;
  }

  const { actor_name, event_type } = notification;
  switch (event_type) {
    case "followed":
      return `${actor_name}さんがあなたをフォローしました`;
    case "follow_request":
      return `${actor_name}さんからフォローリクエストが届きました`;
    case "follow_request_accepted":
      return `${actor_name}さんがフォローリクエストを承認しました`;
    case "group_invitation":
      return `${actor_name}さんが${notification.group_name}に招待しました`;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

export const NotificationItemComponent = ({
  notification,
  onPress,
}: NotificationItemProps) => {
  const isUnread = notification.read_at === null;
  const iconName = getIconName(notification.event_type);
  const text = getNotificationText(notification);

  const isFollowRequest =
    isUserNotification(notification) &&
    notification.event_type === "follow_request";

  const [handled, setHandled] = useState(false);
  const [handledType, setHandledType] = useState<"accepted" | "rejected">();
  const { acceptFollowRequest, isAccepting } = useAcceptFollowRequest();
  const { rejectFollowRequest, isRejecting } = useRejectFollowRequest();

  const handleAccept = async () => {
    if (!isUserNotification(notification) || !notification.follow_request_id)
      return;
    try {
      await acceptFollowRequest(notification.follow_request_id);
      await deleteNotification(notification.id);
      setHandled(true);
      setHandledType("accepted");
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "notification-item", action: "accept" },
      });
    }
  };

  const handleReject = async () => {
    if (!isUserNotification(notification) || !notification.follow_request_id)
      return;
    try {
      await rejectFollowRequest(notification.follow_request_id);
      await deleteNotification(notification.id);
      setHandled(true);
      setHandledType("rejected");
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "notification-item", action: "reject" },
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
        handled && styles.handledContainer,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {isUserNotification(notification) ? (
        notification.actor_icon?.url &&
        !notification.actor_icon.url.endsWith(".svg") &&
        notification.actor_icon.url.length > 0 ? (
          <Image
            source={{
              uri: notification.actor_icon.url.startsWith("http")
                ? notification.actor_icon.url
                : `${API_BASE_URL}${notification.actor_icon.url}`,
            }}
            style={styles.avatar}
          />
        ) : (
          <DefaultUserIcon size={44} />
        )
      ) : (
        <View style={[styles.avatar, styles.iconContainer]}>
          <Ionicons name={iconName} size={22} color="#d08000" />
        </View>
      )}

      <View style={styles.content}>
        {handled ? (
          <Text style={[styles.text, styles.handledText]}>
            <Text style={styles.actorName}>
              {(notification as UserNotification).actor_name}
            </Text>
            さんのフォローリクエストを
            {handledType === "accepted" ? "承認しました" : "拒否しました"}
          </Text>
        ) : (
          <>
            <Text style={styles.text} numberOfLines={2}>
              {isUserNotification(notification) && (
                <Text style={styles.actorName}>{notification.actor_name}</Text>
              )}
              {isUserNotification(notification)
                ? text.slice(notification.actor_name.length)
                : text}
            </Text>
            <View style={styles.meta}>
              {isUserNotification(notification) && (
                <Ionicons
                  name={iconName}
                  size={14}
                  color="#A1A1AA"
                  style={styles.metaIcon}
                />
              )}
              <Text style={styles.date}>
                {formatDate(notification.created_at)}
              </Text>
            </View>
            {isFollowRequest && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAccept}
                  disabled={isAccepting || isRejecting}
                >
                  {isAccepting ? (
                    <ActivityIndicator size="small" color="#F4F4F4" />
                  ) : (
                    <Text style={styles.acceptButtonText}>承認する</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject}
                  disabled={isAccepting || isRejecting}
                >
                  {isRejecting ? (
                    <ActivityIndicator size="small" color="#F4F4F4" />
                  ) : (
                    <Text style={styles.rejectButtonText}>拒否する</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {isUnread && !handled && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3A3A3A",
  },
  unreadContainer: {
    backgroundColor: "rgba(208, 128, 0, 0.06)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconContainer: {
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: "#F4F4F4",
    fontSize: 14,
    lineHeight: 20,
  },
  actorName: {
    fontWeight: "700",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d08000",
    marginLeft: 8,
  },
  handledContainer: {
    opacity: 0.5,
  },
  handledText: {
    color: "#A1A1AA",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "#d08000",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#3A3A3A",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
});
