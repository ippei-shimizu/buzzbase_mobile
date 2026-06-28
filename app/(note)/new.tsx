import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { useNoteMutations } from "@hooks/useNotes";

export default function NoteNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    practiceSessionId?: string;
    gameResultId?: string;
    date?: string;
  }>();
  const { createNote, isCreating } = useNoteMutations();

  // 練習フローから来た場合（practiceSessionId あり）は日付確定済みなので日付ピッカーを隠す。
  const fromPracticeFlow = params.practiceSessionId != null;

  return (
    <NoteForm
      initial={{
        date: params.date,
        practiceSessionId: params.practiceSessionId
          ? Number(params.practiceSessionId)
          : null,
        gameResultId: params.gameResultId ? Number(params.gameResultId) : null,
      }}
      showDatePicker={!fromPracticeFlow}
      submitLabel="保存"
      isSubmitting={isCreating}
      onSubmit={async (input) => {
        try {
          await createNote(input);
          router.back();
        } catch {
          Alert.alert("保存に失敗しました");
        }
      }}
    />
  );
}
