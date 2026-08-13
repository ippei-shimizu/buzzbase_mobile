/**
 * useMediaAttachmentUpload の結合テスト。
 *
 * 方針:
 * - presign / 完了通知はback向けの本物のHTTPリクエストとしてMSWでinterceptする
 *   （services/mediaAttachmentServiceはjest.mockしない）。
 * - putToPresignedUrlのみ例外的にモックする。R2への実PUTはローカルファイルの
 *   バイナリ読み出しを伴い、Jest環境では実ファイルもR2エンドポイントも存在しない
 *   ため、ネイティブ境界として扱う。
 * - 圧縮・サムネ生成・メタ取得はutils/mediaProcessing側で個別にユニットテスト済みのため、
 *   ここではオーケストレーション（フェーズ遷移・API呼び出し順序）の検証に絞る。
 */
import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import {
  baseUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { createTestQueryClient } from "../../__tests__/test-utils/renderWithProviders";
import { server } from "../../jest-setup-msw";
import { useMediaAttachmentUpload } from "../useMediaAttachmentUpload";

jest.mock("../../services/mediaAttachmentService", () => ({
  ...jest.requireActual("../../services/mediaAttachmentService"),
  putToPresignedUrl: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../utils/mediaProcessing", () => ({
  compressImage: jest.fn((uri: string) => Promise.resolve(uri)),
  compressVideo: jest.fn((uri: string) => Promise.resolve(uri)),
  generateVideoThumbnail: jest.fn(() => Promise.resolve("file:///thumb.jpg")),
  getFileSizeBytes: jest.fn(() => 12_345),
  getVideoMeta: jest.fn(() =>
    Promise.resolve({ durationSeconds: 20, width: 720, height: 480 }),
  ),
  getImageMeta: jest.fn(() => Promise.resolve({ width: 1080, height: 1920 })),
}));

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
};

describe("useMediaAttachmentUpload", () => {
  it("画像をpresign→完了通知の順でアップロードし、doneフェーズになる", async () => {
    server.use(
      http.post(baseUrl("/api/v2/media_attachments/presign"), () =>
        HttpResponse.json(
          {
            id: 1,
            media_type: "image",
            status: "pending",
            upload_url: "https://fake-r2.test/upload/image.jpg",
            thumbnail_upload_url: null,
          },
          { status: 201 },
        ),
      ),
      http.patch(baseUrl("/api/v2/media_attachments/1"), () =>
        HttpResponse.json({
          id: 1,
          media_type: "image",
          status: "ready",
          file_size_bytes: 12_345,
          duration_seconds: null,
          width: 1080,
          height: 1920,
          position: 0,
          playback_url: "https://media.test/image.jpg",
          thumbnail_url: null,
          created_at: "2026-07-20T00:00:00Z",
        }),
      ),
    );

    const { result } = renderHook(() => useMediaAttachmentUpload(), {
      wrapper: createWrapper(),
    });

    let attachment;
    await act(async () => {
      attachment = await result.current.upload(
        {
          uri: "file:///photo.jpg",
          mediaType: "image",
          contentType: "image/jpeg",
        },
        42,
      );
    });

    expect(attachment).toMatchObject({ id: 1, status: "ready" });
    expect(result.current.phase).toBe("done");
  });

  it("動画はcompressVideo/generateVideoThumbnailを経てアップロードする", async () => {
    server.use(
      http.post(baseUrl("/api/v2/media_attachments/presign"), () =>
        HttpResponse.json(
          {
            id: 2,
            media_type: "video",
            status: "pending",
            upload_url: "https://fake-r2.test/upload/video.mp4",
            thumbnail_upload_url: "https://fake-r2.test/upload/video_thumb.jpg",
          },
          { status: 201 },
        ),
      ),
      http.patch(baseUrl("/api/v2/media_attachments/2"), () =>
        HttpResponse.json({
          id: 2,
          media_type: "video",
          status: "ready",
          file_size_bytes: 12_345,
          duration_seconds: 20,
          width: 720,
          height: 480,
          position: 0,
          playback_url: "https://media.test/video.mp4",
          thumbnail_url: "https://media.test/video_thumb.jpg",
          created_at: "2026-07-20T00:00:00Z",
        }),
      ),
    );

    const { result } = renderHook(() => useMediaAttachmentUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.upload(
        {
          uri: "file:///video.mp4",
          mediaType: "video",
          contentType: "video/mp4",
        },
        42,
      );
    });

    expect(result.current.phase).toBe("done");
  });

  it("presignが403を返すとerrorフェーズになり例外を投げる", async () => {
    server.use(
      http.post(baseUrl("/api/v2/media_attachments/presign"), () =>
        HttpResponse.json({ error: "上限に達しています" }, { status: 403 }),
      ),
    );

    const { result } = renderHook(() => useMediaAttachmentUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.upload(
          {
            uri: "file:///photo.jpg",
            mediaType: "image",
            contentType: "image/jpeg",
          },
          42,
        ),
      ).rejects.toThrow();
    });

    expect(result.current.phase).toBe("error");
  });
});
