import { create } from "zustand";

export type SnackbarType = "error" | "success" | "info";

interface ShowOptions {
  type?: SnackbarType;
  message: string;
  durationMs?: number;
}

interface SnackbarState {
  visible: boolean;
  type: SnackbarType;
  message: string;
  durationMs: number;
  /** show() ごとにインクリメントし、同一インスタンスでも再アニメーションさせるためのトリガ */
  nonce: number;
  /**
   * Snackbar を表示する。既に表示中でも上書きする（最後に呼ばれた1件のみ表示）。
   * @param opts.type 種別（既定: "info"）
   * @param opts.message 表示メッセージ
   * @param opts.durationMs 自動消去までのms（既定: 3000）
   */
  show: (opts: ShowOptions) => void;
  /** Snackbar を即時非表示にする。 */
  hide: () => void;
}

const DEFAULT_DURATION_MS = 3000;

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  type: "info",
  message: "",
  durationMs: DEFAULT_DURATION_MS,
  nonce: 0,

  show: ({ type = "info", message, durationMs = DEFAULT_DURATION_MS }) =>
    set((state) => ({
      visible: true,
      type,
      message,
      durationMs,
      nonce: state.nonce + 1,
    })),

  hide: () => set({ visible: false }),
}));
