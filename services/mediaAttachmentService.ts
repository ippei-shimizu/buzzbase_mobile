import type {
  MediaAttachment,
  MediaAttachmentCompleteInput,
  MediaAttachmentPresignInput,
  MediaAttachmentPresignResponse,
} from "../types/mediaAttachment";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/media_attachments`;

export const presignMediaUpload = async (
  input: MediaAttachmentPresignInput,
): Promise<MediaAttachmentPresignResponse> => {
  const res = await axiosInstance.post<MediaAttachmentPresignResponse>(
    `${URL}/presign`,
    { media_attachment: input },
  );
  return res.data;
};

export const completeMediaUpload = async (
  id: number,
  input: MediaAttachmentCompleteInput,
): Promise<MediaAttachment> => {
  const res = await axiosInstance.patch<MediaAttachment>(`${URL}/${id}`, {
    media_attachment: input,
  });
  return res.data;
};

export const deleteMediaAttachment = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

/**
 * R2への署名PUTアップロード。axiosInstanceはback向けのbaseURL・認証ヘッダーを
 * 自動付与するため使わず、外部ホスト向けに素のfetchでPUTする。
 */
export const putToPresignedUrl = async (
  uploadUrl: string,
  fileUri: string,
  contentType: string,
): Promise<void> => {
  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();
  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!putResponse.ok) {
    throw new Error(`R2アップロードに失敗しました: ${putResponse.status}`);
  }
};
