export type MediaType = "image" | "video";
export type MediaAttachmentStatus = "pending" | "ready" | "failed";

export interface MediaAttachment {
  id: number;
  media_type: MediaType;
  status: MediaAttachmentStatus;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  position: number;
  playback_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface MediaAttachmentPresignInput {
  baseball_note_id: number;
  media_type: MediaType;
  content_type: string;
}

export interface MediaAttachmentPresignResponse {
  id: number;
  media_type: MediaType;
  status: MediaAttachmentStatus;
  upload_url: string;
  thumbnail_upload_url: string | null;
}

export interface MediaAttachmentCompleteInput {
  duration_seconds?: number;
  width?: number;
  height?: number;
  file_size_bytes: number;
}

/**
 * ノート新規作成中（baseball_note_id未確定）にローカルで保持する選択済みメディア。
 * ノート保存成功後、まとめてアップロードする。
 */
export interface StagedMediaAsset {
  localId: string;
  uri: string;
  mediaType: MediaType;
  contentType: string;
  /** サムネイル代わりのプレビューURI。動画は生成コストを避けるため未生成（null）。 */
  previewUri: string | null;
}
