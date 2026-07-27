import { useCallback, useState } from "react";
import { trimVideo, type VideoTrimResult } from "../utils/videoTrim";

/** 動画トリミング操作のbusy状態を管理する薄いフック。 */
export const useVideoTrim = () => {
  const [isTrimming, setTrimming] = useState(false);

  const trim = useCallback(
    async (
      uri: string,
      maxDurationSeconds?: number,
    ): Promise<VideoTrimResult | null> => {
      setTrimming(true);
      try {
        return await trimVideo(uri, maxDurationSeconds);
      } finally {
        setTrimming(false);
      }
    },
    [],
  );

  return { trim, isTrimming };
};
