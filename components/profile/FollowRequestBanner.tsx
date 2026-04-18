import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from "@hooks/useRelationship";

interface FollowRequestBannerProps {
  followRequestId: number;
  actorName: string;
}

export function FollowRequestBanner({
  followRequestId,
  actorName,
}: FollowRequestBannerProps) {
  const [handled, setHandled] = useState(false);
  const [handledType, setHandledType] = useState<"accepted" | "rejected">();
  const { acceptFollowRequest, isAccepting } = useAcceptFollowRequest();
  const { rejectFollowRequest, isRejecting } = useRejectFollowRequest();

  const handleAccept = async () => {
    try {
      await acceptFollowRequest(followRequestId);
      setHandled(true);
      setHandledType("accepted");
    } catch {}
  };

  const handleReject = async () => {
    try {
      await rejectFollowRequest(followRequestId);
      setHandled(true);
      setHandledType("rejected");
    } catch {}
  };

  if (handled) {
    return (
      <View style={[styles.container, styles.handledContainer]}>
        <Ionicons name="checkmark-circle" size={18} color="#A1A1AA" />
        <Text style={styles.handledText}>
          {actorName}さんのフォローリクエストを
          {handledType === "accepted" ? "承認しました" : "拒否しました"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Ionicons name="person-add" size={18} color="#d08000" />
        <Text style={styles.text}>フォローリクエストが届いています</Text>
      </View>
      <View style={styles.buttonRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(208, 128, 0, 0.1)",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(208, 128, 0, 0.25)",
  },
  handledContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderColor: "#3A3A3A",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  handledText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#d08000",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
});
