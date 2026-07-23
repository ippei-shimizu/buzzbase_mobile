import type { Spec } from "react-native-video-trim";
import NativeVideoTrim, { showEditor } from "react-native-video-trim";

export interface VideoTrimResult {
  uri: string;
  durationSeconds: number;
}

const NO_DURATION_LIMIT = -1;

// デフォルトエクスポートの型がanyのため、Specで明示的にキャストする。
const VideoTrim = NativeVideoTrim as Spec;

/**
 * 動画トリミング編集画面を開き、結果をPromiseで返す。
 * ユーザーが保存せずに閉じた場合はnullを返す（呼び出し側は選択自体を中断する）。
 *
 * @param uri トリミング対象の動画URI（ローカルファイル or https URL）
 * @param maxDurationSeconds トリミングできる最大秒数（省略時は無制限）
 */
export const trimVideo = (
  uri: string,
  maxDurationSeconds?: number,
): Promise<VideoTrimResult | null> =>
  new Promise((resolve, reject) => {
    const cleanup = () => {
      finishSubscription.remove();
      cancelSubscription.remove();
      errorSubscription.remove();
    };

    const finishSubscription = VideoTrim.onFinishTrimming(
      ({ outputPath, duration }) => {
        cleanup();
        resolve({
          uri: outputPath,
          durationSeconds: Math.round(duration / 1000),
        });
      },
    );

    const cancelSubscription = VideoTrim.onCancel(() => {
      cleanup();
      resolve(null);
    });

    const errorSubscription = VideoTrim.onError(({ message }) => {
      cleanup();
      reject(new Error(message));
    });

    showEditor(uri, {
      maxDuration:
        maxDurationSeconds != null
          ? maxDurationSeconds * 1000
          : NO_DURATION_LIMIT,
      theme: "dark",
      headerText: "動画をトリミング",
      saveButtonText: "完了",
      cancelButtonText: "キャンセル",
      saveDialogTitle: "確認",
      saveDialogMessage: "この内容で保存しますか？",
      saveDialogConfirmText: "保存する",
      saveDialogCancelText: "戻る",
      cancelDialogTitle: "確認",
      cancelDialogMessage: "編集内容を破棄しますか？",
      cancelDialogConfirmText: "破棄する",
      cancelDialogCancelText: "戻る",
      trimmingText: "動画を処理中…",
      alertOnFailTitle: "エラー",
      alertOnFailMessage: "動画の読み込みに失敗しました",
      alertOnFailCloseText: "閉じる",
    });
  });
