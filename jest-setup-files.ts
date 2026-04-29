// jest-expo preset の setup.js より前に実行される setupFiles エントリ。
// expo/src/winter/runtime.native は lazy global を install するが、
// その lazy callback 内の require('./ImportMetaRegistry') が
// jest 環境で「outside of the scope」エラーを引き起こすため、
// 関連する依存を no-op に置換する。
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
jest.doMock("expo/src/winter/url", () => ({
  URL: globalThis.URL,
  URLSearchParams: globalThis.URLSearchParams,
}));
jest.doMock("@ungap/structured-clone", () => ({
  default: globalThis.structuredClone ?? ((v: unknown) => v),
}));
