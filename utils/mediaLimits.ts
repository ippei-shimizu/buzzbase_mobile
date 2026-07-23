// backのMediaAttachments::LimitValidatorと同じ境界値。クライアント側の事前チェック用。
export const FREE_VIDEO_MAX_DURATION_SECONDS = 30;
export const PRO_VIDEO_MAX_DURATION_SECONDS = 180;
export const FREE_VIDEO_MAX_HEIGHT = 480;
export const PRO_VIDEO_MAX_HEIGHT = 1080;
export const FREE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRO_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const FREE_MEDIA_MONTHLY_LIMIT = 3;
