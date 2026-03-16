import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBaseballNote } from "@hooks/useBaseballNotes";
import { useDeleteBaseballNote } from "@hooks/useBaseballNoteMutations";
import { slateMemoToText } from "@utils/slateUtils";

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = id ? Number(id) : undefined;
  const { note, isLoading } = useBaseballNote(noteId);
  const { deleteNote, isDeleting } = useDeleteBaseballNote();

  const handleDelete = () => {
    Alert.alert("削除確認", "このノートを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(noteId!);
            router.back();
          } catch {
            Alert.alert("エラー", "ノートの削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>ノートが見つかりません</Text>
      </View>
    );
  }

  const memoText = slateMemoToText(note.memo);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(profile)/notes/edit",
                    params: { id: String(note.id) },
                  })
                }
              >
                <Ionicons name="create-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{note.date}</Text>
        <Text style={styles.memo}>{memoText}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 20,
  },
  memo: {
    color: "#D4D4D8",
    fontSize: 15,
    lineHeight: 24,
  },
});
