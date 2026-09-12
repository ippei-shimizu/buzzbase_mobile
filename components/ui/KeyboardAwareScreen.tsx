import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * ヘッダー分のオフセット(px)。ネイティブヘッダーを持つ画面は、その高さを渡さないと
   * iOS でキーボードとフィールドが重なる。既定値はネイティブヘッダー1段ぶん。
   */
  keyboardVerticalOffset?: number;
}

const DEFAULT_HEADER_OFFSET = 96;

/**
 * 入力欄がキーボードに隠れないよう、画面下に余白を確保するラッパー。
 *
 * 中身のスクロールは呼び出し側の ScrollView に任せる。フォーカス追従（自動スクロール）は
 * サジェスト候補が見切れる不具合が出るため行わず、余白の確保だけに責務を絞っている。
 */
export function KeyboardAwareScreen({
  children,
  style,
  keyboardVerticalOffset = DEFAULT_HEADER_OFFSET,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? keyboardVerticalOffset : 0
      }
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
});
