import type {
  MediaAttachment,
  MediaAttachmentCompleteInput,
  MediaAttachmentMemoInput,
  MediaAttachmentPresignInput,
  MediaAttachmentPresignResponse,
} from "../types/mediaAttachment";
import { FileSystemUploadType, uploadAsync } from "expo-file-system/legacy";
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

export const updateMediaAttachmentMemo = async (
  id: number,
  input: MediaAttachmentMemoInput,
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
 * 自動付与するため使わず、外部ホスト向けに素のuploadAsyncでPUTする。
 * fetch+blobだとファイル全体をJSメモリに展開してしまうため、ネイティブ側で
 * ストリーミング送信できるuploadAsyncを使う（動画は圧縮後でも数十MBになりうる）。
 */
export const putToPresignedUrl = async (
  uploadUrl: string,
  fileUri: string,
  contentType: string,
): Promise<void> => {
  const result = await uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": contentType },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`R2アップロードに失敗しました: ${result.status}`);
  }
};
