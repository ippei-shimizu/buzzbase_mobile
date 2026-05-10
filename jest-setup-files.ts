// jest-expo preset の setup.js より前に実行される setupFiles エントリ。
// expo/src/winter/runtime.native は lazy global を install するが、
// その lazy callback 内の require('./ImportMetaRegistry') が
// jest 環境で「outside of the scope」エラーを引き起こすため、
// 関連する依存を no-op に置換する。

// MSW v2 は内部で globalThis.ReadableStream に対して cancel/read を行う。
// jest-expo は web-streams-polyfill v4 を ReadableStream として install するが、
// その実装と MSW の挙動の組み合わせで `Cannot cancel a stream that already has
// a reader` が発生するため、Node 標準の Web Streams に置き換える。
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeStreams = require("node:stream/web");

Object.defineProperty(globalThis, "ReadableStream", {
  value: nodeStreams.ReadableStream,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "WritableStream", {
  value: nodeStreams.WritableStream,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "TransformStream", {
  value: nodeStreams.TransformStream,
  writable: true,
  configurable: true,
});
jest.doMock("expo/src/winter/ImportMetaRegistry", () => ({
  ImportMetaRegistry: { url: null },
}));
jest.doMock("expo/src/winter/TextDecoder", () => ({
  TextDecoder: globalThis.TextDecoder,
}));
jest.doMock("expo/src/winter/TextDecoderStream", () => ({
  TextDecoderStream: class {},
  TextEncoderStream: class {},
}));
// `globalThis.URL` / `globalThis.URLSearchParams` を直接参照すると expo/winter
// の lazy getter が走り、MSW v2 等が globalThis.URLSearchParams に触れた瞬間に
// このコールバックが再帰呼び出しされて TypeError になるため、Node 標準の
// `url` モジュールから取り出す。
jest.doMock("expo/src/winter/url", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeUrl = require("url");
  return {
    URL: nodeUrl.URL,
    URLSearchParams: nodeUrl.URLSearchParams,
  };
});
jest.doMock("@ungap/structured-clone", () => ({
  default: globalThis.structuredClone ?? ((v: unknown) => v),
}));
