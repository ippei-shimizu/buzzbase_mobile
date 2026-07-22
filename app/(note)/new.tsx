import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { PaywallModal } from "@components/pro/PaywallModal";
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
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const goToNoteList = () => router.replace("/(records)/list?tab=note");

  // 練習フローから来た場合（practiceSessionId あり）は日付確定済みなので日付ピッカーを隠す。
  const fromPracticeFlow = params.practiceSessionId != null;

  return (
    <>
      <NoteForm
        initial={{
          date: params.date,
          practiceSessionId: params.practiceSessionId
            ? Number(params.practiceSessionId)
            : null,
          gameResultIds: params.gameResultId
            ? [Number(params.gameResultId)]
            : [],
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

          if (stagedMedia.length === 0) {
            goToNoteList();
            return;
          }

          setUploadingMedia(true);
          let failedCount = 0;
          let limitReached = false;
          for (const asset of stagedMedia) {
            try {
              await upload(
                {
                  uri: asset.uri,
                  mediaType: asset.mediaType,
                  contentType: asset.contentType,
                  memo: asset.memo,
                },
                note.id,
              );
            } catch (error) {
              failedCount += 1;
              if (isAxiosError(error) && error.response?.status === 403) {
                limitReached = true;
              }
            }
          }
          setUploadingMedia(false);

          // 上限到達時はPro訴求モーダルを優先表示し、閉じたタイミングで遷移する
          // （ノート本体は既に保存済みのため、モーダルを閉じるだけで完了扱いにする）。
          if (limitReached) {
            setPaywallOpen(true);
            return;
          }
          if (failedCount > 0) {
            Alert.alert(
              "一部のメディアのアップロードに失敗しました",
              "ノートは保存されています。編集画面から追加し直せます。",
            );
          }
          goToNoteList();
        }}
      />
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => {
          setPaywallOpen(false);
          goToNoteList();
        }}
        feature="unlimited_media_uploads"
      />
    </>
  );
}
