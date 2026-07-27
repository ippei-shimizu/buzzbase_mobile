import * as Sentry from "@sentry/react-native";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import { NoteForm } from "@components/note/NoteForm";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useMediaAttachmentUpload } from "@hooks/useMediaAttachmentUpload";
import { useNoteMutations } from "@hooks/useNotes";
import { FREE_MEDIA_MONTHLY_LIMIT } from "@utils/mediaLimits";

export default function NoteNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    practiceSessionId?: string;
    gameResultId?: string;
    improvementThemeIds?: string;
    date?: string;
  }>();
  const { createNote, deleteNote, isCreating } = useNoteMutations();
  const { upload } = useMediaAttachmentUpload();
  const [isUploadingMedia, setUploadingMedia] = useState(false);
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [limitReachedCount, setLimitReachedCount] = useState(0);

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
          let technicalFailureCount = 0;
          let limitReachedCountThisRun = 0;
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
              if (isAxiosError(error) && error.response?.status === 403) {
                limitReachedCountThisRun += 1;
              } else {
                technicalFailureCount += 1;
                // __DEV__時はSentryへ送信されない(app/_layout.tsxでenabled: !__DEV__)ため、
                // ローカル調査用にMetroへも出力する。
                console.error("[baseball_note_media_upload]", error);
                Sentry.captureException(error, {
                  tags: { source: "baseball_note_media_upload" },
                });
              }
            }
          }
          setUploadingMedia(false);

          // technicalFailureCountを優先判定する。上限到達（limitReachedCountThisRun）と
          // 技術的失敗が同時に起きた場合、後者を握りつぶしてPaywallだけ出すと
          // 技術的失敗分のノートがロールバックされないまま残ってしまうため。
          if (technicalFailureCount > 0) {
            // メディア添付が前提でノートを作成しているため、失敗時はノートごと
            // 保存されなかったことにする（文字だけの空ノートが残るのを防ぐ）。
            await deleteNote(note.id).catch((error) => {
              Sentry.captureException(error, {
                tags: { source: "baseball_note_rollback_on_media_failure" },
              });
            });
            Alert.alert(
              "メディアの保存に失敗しました",
              "ノートは保存されませんでした。もう一度お試しください。",
            );
            return;
          }
          // 上限到達時はPro訴求モーダルを優先表示し、閉じたタイミングで遷移する
          // （ノート本体は既に保存済みのため、モーダルを閉じるだけで完了扱いにする）。
          if (limitReachedCountThisRun > 0) {
            setLimitReachedCount(limitReachedCountThisRun);
            setPaywallOpen(true);
            return;
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
        contextMessage={`今月の無料上限（${FREE_MEDIA_MONTHLY_LIMIT}件）に達したため、${limitReachedCount}件の画像・動画は保存できませんでした。`}
      />
    </>
  );
}
