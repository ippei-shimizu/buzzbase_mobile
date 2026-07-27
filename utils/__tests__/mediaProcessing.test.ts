/**
 * mediaProcessing のユニットテスト。
 * ネイティブモジュール境界（expo-video / expo-video-thumbnails /
 * react-native-compressor / expo-file-system / react-native Image）を
 * jest.mock / jest.spyOn で局所モックする。
 */
import { Image } from "react-native";
import {
  Image as ImageCompressor,
  Video as VideoCompressor,
} from "react-native-compressor";
import {
  compressImage,
  compressVideo,
  generateVideoThumbnail,
  getFileSizeBytes,
  getImageMeta,
} from "../mediaProcessing";

jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation(() => ({ size: 12_345 })),
}));

describe("compressVideo", () => {
  it("react-native-compressorで指定した長辺(maxSize)まで圧縮したURIを返す", async () => {
    const uri = await compressVideo("file:///original.mp4", 1080);
    expect(VideoCompressor.compress).toHaveBeenCalledWith(
      "file:///original.mp4",
      { compressionMethod: "manual", maxSize: 1080 },
    );
    expect(uri).toBe("file:///original.mp4");
  });
});

describe("compressImage", () => {
  it("react-native-compressorで長辺1080px・品質0.7に圧縮したURIを返す", async () => {
    const uri = await compressImage("file:///original.jpg");
    expect(ImageCompressor.compress).toHaveBeenCalledWith(
      "file:///original.jpg",
      {
        compressionMethod: "manual",
        maxWidth: 1080,
        maxHeight: 1080,
        quality: 0.7,
      },
    );
    expect(uri).toBe("file:///original.jpg");
  });
});

describe("generateVideoThumbnail", () => {
  it("動画のファーストフレームからサムネイルURIを返す", async () => {
    const uri = await generateVideoThumbnail("file:///video.mp4");
    expect(uri).toBe("file:///mock-thumbnail.jpg");
  });
});

describe("getFileSizeBytes", () => {
  it("File.sizeを返す", () => {
    expect(getFileSizeBytes("file:///video.mp4")).toBe(12_345);
  });
});

describe("getImageMeta", () => {
  it("Image.getSizeの結果をwidth/heightとして返す", async () => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => {
      success(1080, 1920);
    });

    const meta = await getImageMeta("file:///image.jpg");
    expect(meta).toEqual({ width: 1080, height: 1920 });
  });

  it("Image.getSizeが失敗したらrejectする", async () => {
    jest
      .spyOn(Image, "getSize")
      .mockImplementation((_uri, _success, failure) => {
        failure?.(new Error("failed to get size"));
      });

    await expect(getImageMeta("file:///broken.jpg")).rejects.toThrow(
      "failed to get size",
    );
  });
});

describe("getVideoMeta", () => {
  it("sourceLoadイベントからduration/width/heightを取得する", async () => {
    const listeners: Record<string, (payload: unknown) => void> = {};
    const release = jest.fn();
    jest.doMock("expo-video", () => ({
      createVideoPlayer: jest.fn(() => ({
        release,
        addListener: (event: string, listener: (payload: unknown) => void) => {
          listeners[event] = listener;
          return { remove: jest.fn() };
        },
      })),
    }));
    jest.resetModules();

    const {
      getVideoMeta: getVideoMetaWithMock,
    } = require("../mediaProcessing");

    const resultPromise = getVideoMetaWithMock("file:///video.mp4");
    listeners.sourceLoad({
      duration: 25.4,
      availableVideoTracks: [{ size: { width: 720, height: 480 } }],
    });

    await expect(resultPromise).resolves.toEqual({
      durationSeconds: 25,
      width: 720,
      height: 480,
    });
    expect(release).toHaveBeenCalled();
  });
});
