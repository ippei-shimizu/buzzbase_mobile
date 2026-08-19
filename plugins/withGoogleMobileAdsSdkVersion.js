const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

// react-native-google-mobile-ads がデフォルトで固定するGoogle-Mobile-Ads-SDK(iOS)
// 13.5.0にはPrivacyInfo.xcprivacyの不整合があり、Apple審査提出時に
// ITMS-91064(NSPrivacyTracking must be true if NSPrivacyTrackingDomains isn't empty)
// で弾かれる。RNGoogleMobileAds.podspecが公式に対応しているPodfile側のバージョン
// 上書き変数($RNGoogleMobileAdsSDKVersion)で、修正済みの新しいSDKバージョンに固定する。
const GOOGLE_MOBILE_ADS_SDK_VERSION = "13.7.0";

const PODFILE_MARKER_BEGIN = "# @generated begin google-mobile-ads-sdk-version";
const PODFILE_MARKER_END = "# @generated end google-mobile-ads-sdk-version";

const injectPodfileVersion = (contents) => {
  if (contents.includes(PODFILE_MARKER_BEGIN)) return contents;
  const block = [
    PODFILE_MARKER_BEGIN,
    `$RNGoogleMobileAdsSDKVersion = '${GOOGLE_MOBILE_ADS_SDK_VERSION}'`,
    PODFILE_MARKER_END,
    "",
  ].join("\n");
  return block + contents;
};

const withGoogleMobileAdsSdkVersion = (config) =>
  withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(podfilePath, "utf-8");
      fs.writeFileSync(podfilePath, injectPodfileVersion(contents));
      return config;
    },
  ]);

module.exports = withGoogleMobileAdsSdkVersion;
