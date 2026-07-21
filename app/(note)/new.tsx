import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { useMediaAttachmentUpload } from "@hooks/useMediaAttachmentUpload";
import { useNoteMutations } from "@hooks/useNotes";

export default function NoteNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    practiceSessionId?: string;
    gameResultId?: string;
    improvementThemeIds?: string;
    date?: string;
  }>();
  const { createNote, isCreating } = useNoteMutations();
  const { upload } = useMediaAttachmentUpload();
  const [isUploadingMedia, setUploadingMedia] = useState(false);

  // 練習フローから来た場合（practiceSessionId あり）は日付確定済みなので日付ピッカーを隠す。
  const fromPracticeFlow = params.practiceSessionId != null;

  return (
    <NoteForm
      initial={{
        date: params.date,
        practiceSessionId: params.practiceSessionId
          ? Number(params.practiceSessionId)
          : null,
        gameResultIds: params.gameResultId ? [Number(params.gameResultId)] : [],
        improvementThemeIds: params.improvementThemeIds
          ? params.improvementThemeIds.split(",").map(Number)
          : [],
      }}
      showDatePicker={!fromPracticeFlow}
      submitLabel="保存"
      isSubmitting={isCreating || isUploadingMedia}
      onSubmit={async (input, stagedMedia) => {
        let note;
        try {
          note = await createNote(input);
        } catch {
          Alert.alert("保存に失敗しました");
          return;
        }

        if (stagedMedia.length > 0) {
          setUploadingMedia(true);
          let failedCount = 0;
          for (const asset of stagedMedia) {
            try {
              await upload(
                {
                  uri: asset.uri,
                  mediaType: asset.mediaType,
                  contentType: asset.contentType,
                },
                note.id,
              );
            } catch {
              failedCount += 1;
            }
          }
          setUploadingMedia(false);
          if (failedCount > 0) {
            Alert.alert(
              "一部のメディアのアップロードに失敗しました",
              "ノートは保存されています。編集画面から追加し直せます。",
            );
          }
        }
        router.replace("/(records)/list?tab=note");
      }}
    />
  );
}
