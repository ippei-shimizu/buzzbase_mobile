import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { themeCategoryLabel } from "@constants/improvementTheme";
import {
  useImprovementThemeMutations,
  useImprovementThemes,
} from "@hooks/useImprovementThemes";
import { useNotes } from "@hooks/useNotes";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { formatJaFullDate } from "@utils/formatDate";

const todayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function ThemeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeId = Number(id);
  const { themes, isLoading } = useImprovementThemes();
  const { updateTheme, deleteTheme } = useImprovementThemeMutations();
  const { sessions } = usePracticeSessions({ improvement_theme_id: themeId });
  const { notes } = useNotes({ improvement_theme_id: themeId });
  const theme = themes.find((item) => item.id === themeId) ?? null;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!theme) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>課題が見つかりません</Text>
      </View>
    );
  }

  const handleAchieve = async () => {
    await updateTheme({
      id: themeId,
      input: { status: "achieved", achieved_on: todayString() },
    });
  };

  const handleReopen = async () => {
    await updateTheme({ id: themeId, input: { status: "open" } });
  };

  const handleArchive = async () => {
    await updateTheme({ id: themeId, input: { status: "archived" } });
  };

  const handleDelete = () => {
    Alert.alert("この課題を削除しますか？", "紐付いた記録は残ります。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deleteTheme(themeId);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{theme.title}</Text>
      <Text style={styles.meta}>
        {themeCategoryLabel(theme.category)}・{theme.started_on} 開始
      </Text>
      {theme.purpose ? (
        <Text style={styles.purpose}>{theme.purpose}</Text>
      ) : null}

      <View style={styles.statsRow}>
        <Stat label="取組日数" value={`${theme.active_days}日`} />
        <Stat label="練習" value={`${theme.practice_logs_count}`} />
        <Stat label="ノート" value={`${theme.notes_count}`} />
      </View>

      <Text style={styles.sectionHeading}>紐づく練習記録</Text>
      {sessions.length === 0 ? (
        <Text style={styles.linkedEmpty}>まだありません</Text>
      ) : (
        sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.linkedRow}
            onPress={() => router.push(`/(practice-record)/${session.id}`)}
          >
            <Ionicons name="barbell-outline" size={16} color="#d08000" />
            <Text style={styles.linkedRowText} numberOfLines={1}>
              {formatJaFullDate(session.logged_on)}
              {session.practice_logs?.length
                ? ` ・ ${session.practice_logs
                    .map((log) => log.menu_name)
                    .join("、")}`
                : ""}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#71717A" />
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionHeading}>紐づく野球ノート</Text>
      {notes.length === 0 ? (
        <Text style={styles.linkedEmpty}>まだありません</Text>
      ) : (
        notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            style={styles.linkedRow}
            onPress={() => router.push(`/(note)/${note.id}`)}
          >
            <Ionicons name="document-text-outline" size={16} color="#d08000" />
            <Text style={styles.linkedRowText} numberOfLines={1}>
              {formatJaFullDate(note.date)} ・ {note.title || "無題のノート"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#71717A" />
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          router.push(`/(note)/new?improvementThemeId=${theme.id}`)
        }
      >
        <Text style={styles.primaryButtonText}>この課題でノートを書く</Text>
      </TouchableOpacity>

      {theme.status === "open" ? (
        <TouchableOpacity style={styles.achieveButton} onPress={handleAchieve}>
          <Text style={styles.achieveButtonText}>克服した（達成）</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleReopen}>
          <Text style={styles.secondaryButtonText}>取組中に戻す</Text>
        </TouchableOpacity>
      )}

      {theme.status !== "archived" ? (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleArchive}
        >
          <Text style={styles.secondaryButtonText}>アーカイブ</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>削除</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "700" },
  meta: { color: "#A1A1AA", fontSize: 13, marginTop: 8 },
  purpose: { color: "#F4F4F4", fontSize: 14, lineHeight: 21, marginTop: 12 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { color: "#d08000", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
  sectionHeading: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  linkedEmpty: {
    color: "#71717A",
    fontSize: 13,
    paddingVertical: 8,
  },
  linkedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  linkedRowText: { color: "#F4F4F4", fontSize: 13, flex: 1 },
  primaryButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  achieveButton: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d08000",
  },
  achieveButtonText: { color: "#d08000", fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: { color: "#F4F4F4", fontSize: 15 },
  deleteButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: { color: "#EF4444", fontSize: 14 },
});
