import { File } from "expo-file-system";
import { createVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Image } from "react-native";
import {
  Image as ImageCompressor,
  Video as VideoCompressor,
} from "react-native-compressor";

const VIDEO_META_TIMEOUT_MS = 10_000;
const IMAGE_MAX_DIMENSION = 1080;
const IMAGE_COMPRESSION_QUALITY = 0.7;

/**
 * 動画をクライアント側で圧縮する（サーバーffmpegは使わない）。R2の保存コストを抑えるため、
 * 長辺をプランごとの解像度上限（maxSize）まで縮小する。圧縮後のファイルURIを返す。
 */
export const compressVideo = async (
  uri: string,
  maxSize: number,
): Promise<string> =>
  VideoCompressor.compress(uri, { compressionMethod: "manual", maxSize });

/**
 * 画像をクライアント側で圧縮する。サイズ上限のチェック用ではなく、R2の保存コストを
 * 抑えるため上限未満でも常に長辺1080px・品質0.7を目安に縮小する。
 */
export const compressImage = async (uri: string): Promise<string> =>
  ImageCompressor.compress(uri, {
    compressionMethod: "manual",
    maxWidth: IMAGE_MAX_DIMENSION,
    maxHeight: IMAGE_MAX_DIMENSION,
    quality: IMAGE_COMPRESSION_QUALITY,
  });

/** 動画のファーストフレームからサムネイル画像を生成する。 */
export const generateVideoThumbnail = async (uri: string): Promise<string> => {
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 0,
  });
  return thumbnailUri;
};

export const getFileSizeBytes = (uri: string): number => new File(uri).size;

export interface VideoMeta {
  durationSeconds: number;
  width: number;
  height: number;
}

/**
 * 動画の長さ・解像度を取得する。expo-videoはプレイヤーがソースを読み込み終えるまで
 * メタ情報を持たないため、sourceLoadイベントを1回だけ待って取得する。
 */
export const getVideoMeta = (uri: string): Promise<VideoMeta> =>
  new Promise((resolve, reject) => {
    const player = createVideoPlayer(uri);
    const timeout = setTimeout(() => {
      subscription.remove();
      player.release();
      reject(new Error("動画情報の取得がタイムアウトしました"));
    }, VIDEO_META_TIMEOUT_MS);

    const subscription = player.addListener("sourceLoad", (payload) => {
      clearTimeout(timeout);
      subscription.remove();
      const track = payload.availableVideoTracks[0];
      player.release();
      resolve({
        durationSeconds: Math.round(payload.duration),
        width: track?.size.width ?? 0,
        height: track?.size.height ?? 0,
      });
    });
  });

export interface ImageMeta {
  width: number;
  height: number;
}

export const getImageMeta = (uri: string): Promise<ImageMeta> =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
