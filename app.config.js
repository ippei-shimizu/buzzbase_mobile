const appJson = require("./app.json");

const ADMOB_PLUGIN = "react-native-google-mobile-ads";
// Google が公開しているサンプルアプリID。開発ビルドで実IDを焼き込まないために使う
// （広告ユニットIDが constants/admob.ts で __DEV__ 時に TestIds を使うのと同じ方針）。
const SAMPLE_ADMOB_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const RELEASE_ENVS = ["production", "preview"];

const isReleaseBuild = () =>
  RELEASE_ENVS.includes(process.env.EXPO_PUBLIC_APP_ENV ?? "");

/**
 * AdMobのアプリIDを解決する。
 *
 * アプリIDはネイティブビルドに焼き込まれるため、未設定・不正な値のままprebuildすると
 * Google Mobile Ads SDKが初期化時に例外を投げるか、全広告リクエストが失敗する。
 * ビルド後まで気づけないので、リリースビルドでは未設定をその場でエラーにする。
 *
 * @param {string} platform - エラーメッセージ用のプラットフォーム名
 * @param {string | undefined} appId - 環境変数から渡された実アプリID
 * @returns {string} 焼き込むアプリID
 */
const resolveAdmobAppId = (platform, appId) => {
  if (appId) return appId;
  if (isReleaseBuild()) {
    throw new Error(
      `AdMobの${platform}アプリIDが未設定です。AdMob管理画面で発行したIDをEASの環境変数に設定してください。`,
    );
  }
  return SAMPLE_ADMOB_APP_ID;
};

const withAdmobAppIds = (plugin) => {
  if (!Array.isArray(plugin) || plugin[0] !== ADMOB_PLUGIN) return plugin;

  const [name, options] = plugin;
  return [
    name,
    {
      ...options,
      iosAppId: resolveAdmobAppId(
        "iOS",
        process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? options.iosAppId,
      ),
      androidAppId: resolveAdmobAppId(
        "Android",
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
      ),
    },
  ];
};

module.exports = () => ({
  ...appJson.expo,
  plugins: appJson.expo.plugins.map(withAdmobAppIds),
});
