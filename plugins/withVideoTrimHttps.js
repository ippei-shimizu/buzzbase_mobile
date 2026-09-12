const fs = require("fs");
const path = require("path");
const {
  withDangerousMod,
  withGradleProperties,
} = require("@expo/config-plugins");

// managed workflowではios//android/がprebuildのたびに再生成されるため、
// react-native-video-trimがリモート(https)URLをトリミングするのに必要な
// ffmpeg-kitのHTTPS対応パッケージ選択（podspec/build.gradleがENV・gradle
// propertyを見て決定する）を、prebuild時に毎回自動で注入する。
const PODFILE_MARKER_BEGIN = "# @generated begin video-trim-https";
const PODFILE_MARKER_END = "# @generated end video-trim-https";

const injectPodfileEnv = (contents) => {
  if (contents.includes(PODFILE_MARKER_BEGIN)) return contents;
  const block = [
    PODFILE_MARKER_BEGIN,
    "ENV['FFMPEGKIT_PACKAGE'] ||= 'https'",
    "ENV['FFMPEG_KIT_PACKAGE_VERSION'] ||= '6.0'",
    PODFILE_MARKER_END,
    "",
  ].join("\n");
  return block + contents;
};

const withVideoTrimHttpsIOS = (config) =>
  withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(podfilePath, "utf-8");
      fs.writeFileSync(podfilePath, injectPodfileEnv(contents));
      return config;
    },
  ]);

const withVideoTrimHttpsAndroid = (config) =>
  withGradleProperties(config, (config) => {
    const hasEntry = config.modResults.some(
      (item) =>
        item.type === "property" && item.key === "VideoTrim_ffmpeg_package",
    );
    if (!hasEntry) {
      config.modResults.push(
        { type: "property", key: "VideoTrim_ffmpeg_package", value: "https" },
        { type: "property", key: "VideoTrim_ffmpeg_version", value: "6.0" },
      );
    }
    return config;
  });

module.exports = (config) =>
  withVideoTrimHttpsAndroid(withVideoTrimHttpsIOS(config));
