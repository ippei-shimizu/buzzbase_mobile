// backのMediaAttachments::LimitValidatorと同じ境界値。クライアント側の事前チェック用。
export const FREE_VIDEO_MAX_DURATION_SECONDS = 30;
export const PRO_VIDEO_MAX_DURATION_SECONDS = 180;
export const FREE_VIDEO_MAX_HEIGHT = 480;
export const PRO_VIDEO_MAX_HEIGHT = 1280;

// Pro の圧縮ビットレート(bps)。長辺1280pxの動きの速い映像でブロックノイズが出ない下限として
// 3Mbps を採用している。無料枠は自動算出のままにして R2 の保存量を抑える。
export const PRO_VIDEO_BITRATE_BPS = 3_000_000;
export const FREE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRO_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const FREE_MEDIA_MONTHLY_LIMIT = 3;
