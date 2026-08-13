import { useLocalSearchParams, useRouter } from "expo-router";
import { FollowsTabsView } from "@components/profile/FollowsTabsView";

export default function NotificationFollowsScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();

  return (
    <FollowsTabsView
      userId={id ? Number(id) : undefined}
      initialTab={tab === "followers" ? "followers" : "following"}
      onUserPress={(userId) => router.push(`/notifications/user/${userId}`)}
    />
  );
}
