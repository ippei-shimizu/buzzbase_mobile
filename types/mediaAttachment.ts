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
