/**
 * videoTrim のユニットテスト。
 * jest-setup.ts のグローバルモックはno-opのため、イベント発火を検証したいテストでは
 * jest.doMock + jest.resetModules でイベント購読を差し替えたモジュールを都度requireする。
 */
describe("trimVideo", () => {
  it("onFinishTrimmingが発火したらuri/durationSecondsをresolveする", async () => {
    let finishListener: (payload: {
      outputPath: string;
      duration: number;
    }) => void = () => {};
    const showEditor = jest.fn();
    jest.doMock("react-native-video-trim", () => ({
      __esModule: true,
      showEditor,
      default: {
        onFinishTrimming: (listener: typeof finishListener) => {
          finishListener = listener;
          return { remove: jest.fn() };
        },
        onCancel: jest.fn(() => ({ remove: jest.fn() })),
        onError: jest.fn(() => ({ remove: jest.fn() })),
      },
    }));
    jest.resetModules();

    const { trimVideo: trimVideoWithMock } = require("../videoTrim");

    const resultPromise = trimVideoWithMock("file:///original.mp4", 60);
    finishListener({ outputPath: "file:///trimmed.mp4", duration: 45_000 });

    await expect(resultPromise).resolves.toEqual({
      uri: "file:///trimmed.mp4",
      durationSeconds: 45,
    });
    expect(showEditor).toHaveBeenCalledWith(
      "file:///original.mp4",
      expect.objectContaining({ maxDuration: 60_000 }),
    );
  });

  it("onCancelが発火したらnullをresolveする", async () => {
    let cancelListener: () => void = () => {};
    jest.doMock("react-native-video-trim", () => ({
      __esModule: true,
      showEditor: jest.fn(),
      default: {
        onFinishTrimming: jest.fn(() => ({ remove: jest.fn() })),
        onCancel: (listener: () => void) => {
          cancelListener = listener;
          return { remove: jest.fn() };
        },
        onError: jest.fn(() => ({ remove: jest.fn() })),
      },
    }));
    jest.resetModules();

    const { trimVideo: trimVideoWithMock } = require("../videoTrim");

    const resultPromise = trimVideoWithMock("file:///original.mp4");
    cancelListener();

    await expect(resultPromise).resolves.toBeNull();
  });

  it("onErrorが発火したらrejectする", async () => {
    let errorListener: (payload: { message: string }) => void = () => {};
    jest.doMock("react-native-video-trim", () => ({
      __esModule: true,
      showEditor: jest.fn(),
      default: {
        onFinishTrimming: jest.fn(() => ({ remove: jest.fn() })),
        onCancel: jest.fn(() => ({ remove: jest.fn() })),
        onError: (listener: typeof errorListener) => {
          errorListener = listener;
          return { remove: jest.fn() };
        },
      },
    }));
    jest.resetModules();

    const { trimVideo: trimVideoWithMock } = require("../videoTrim");

    const resultPromise = trimVideoWithMock("file:///original.mp4");
    errorListener({ message: "trim failed" });

    await expect(resultPromise).rejects.toThrow("trim failed");
  });

  it("maxDurationSecondsを省略した場合は無制限を意味する値を渡す", () => {
    const showEditor = jest.fn();
    jest.doMock("react-native-video-trim", () => ({
      __esModule: true,
      showEditor,
      default: {
        onFinishTrimming: jest.fn(() => ({ remove: jest.fn() })),
        onCancel: jest.fn(() => ({ remove: jest.fn() })),
        onError: jest.fn(() => ({ remove: jest.fn() })),
      },
    }));
    jest.resetModules();

    const { trimVideo: trimVideoWithMock } = require("../videoTrim");
    trimVideoWithMock("file:///original.mp4");

    expect(showEditor).toHaveBeenCalledWith(
      "file:///original.mp4",
      expect.objectContaining({ maxDuration: -1 }),
    );
  });
});
