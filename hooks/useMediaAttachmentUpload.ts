import type { MediaAttachment, MediaType } from "../types/mediaAttachment";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  completeMediaUpload,
  presignMediaUpload,
  putToPresignedUrl,
} from "../services/mediaAttachmentService";
import {
  compressVideo,
  generateVideoThumbnail,
  getFileSizeBytes,
  getImageMeta,
  getVideoMeta,
} from "../utils/mediaProcessing";

export type UploadPhase =
  | "idle"
  | "compressing"
  | "uploading"
  | "finalizing"
  | "done"
  | "error";

interface UploadAsset {
  uri: string;
  mediaType: MediaType;
  contentType: string;
}

/**
 * 画像・動画アップロードの一連の流れ（圧縮/サムネ生成 → 署名URL取得 → R2へPUT → 完了通知）を
 * 1つの`upload()`にまとめて提供する。複数ステップの進捗をuseMutationの`isPending`単体より
 * 細かく公開したいため、TanStack Queryのmutationではなく独自stateで管理する。
 */
export const useMediaAttachmentUpload = () => {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const upload = useCallback(
    async (
      asset: UploadAsset,
      baseballNoteId: number,
    ): Promise<MediaAttachment> => {
      setError(null);
      try {
        let fileUri = asset.uri;
        let thumbnailUri: string | null = null;
        let width = 0;
        let height = 0;
        let durationSeconds: number | undefined;

        if (asset.mediaType === "video") {
          setPhase("compressing");
          fileUri = await compressVideo(fileUri);
          thumbnailUri = await generateVideoThumbnail(fileUri);
          const meta = await getVideoMeta(fileUri);
          width = meta.width;
          height = meta.height;
          durationSeconds = meta.durationSeconds;
        } else {
          const meta = await getImageMeta(fileUri);
          width = meta.width;
          height = meta.height;
        }

        const fileSizeBytes = getFileSizeBytes(fileUri);

        setPhase("uploading");
        const presigned = await presignMediaUpload({
          baseball_note_id: baseballNoteId,
          media_type: asset.mediaType,
          content_type: asset.contentType,
        });

        await putToPresignedUrl(
          presigned.upload_url,
          fileUri,
          asset.contentType,
        );
        if (presigned.thumbnail_upload_url && thumbnailUri) {
          await putToPresignedUrl(
            presigned.thumbnail_upload_url,
            thumbnailUri,
            "image/jpeg",
          );
        }

        setPhase("finalizing");
        const completed = await completeMediaUpload(presigned.id, {
          duration_seconds: durationSeconds,
          width,
          height,
          file_size_bytes: fileSizeBytes,
        });

        setPhase("done");
        queryClient.invalidateQueries({ queryKey: ["notesV2"] });
        queryClient.invalidateQueries({ queryKey: ["note", baseballNoteId] });
        return completed;
      } catch (thrown) {
        setPhase("error");
        const uploadError =
          thrown instanceof Error ? thrown : new Error(String(thrown));
        setError(uploadError);
        throw uploadError;
      }
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  return { upload, phase, error, reset };
};
