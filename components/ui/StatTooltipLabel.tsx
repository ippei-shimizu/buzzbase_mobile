import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

interface Props {
  /** ツールチップのタイトルおよびトリガー表示で使うラベル（例: "防御率"、"K/9"） */
  label: string;
  /** タップで表示する説明文 */
  tooltip: string;
  /**
   * トリガー側で別表記で表示したい場合に指定する（例: 縦書き用に改行を含めた文字列）。
   * 指定されればトリガー Text のみこちらを使う。Modal タイトルは常に `label` を使う。
   */
  displayLabel?: string;
  /** ラベルテキスト用スタイル（既存セルのフォントカラー等を引き継ぐ） */
  textStyle?: StyleProp<TextStyle>;
  /** Pressable のスタイル（既存セルの border / padding を引き継ぐ） */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * 成績テーブルの見出しラベル用ツールチップ。
 *
 * 既存の `<Text>` セルを置き換える形で使う。タップすると Modal でオーバーレイし、
 * 計算式やイニング制対応などの補足を表示する。背景タップで閉じる挙動。
 * iOS / Android で Popover ライブラリ依存を増やさないため、軽量な Modal 実装にしている。
 */
export function StatTooltipLabel({
  label,
  tooltip,
  displayLabel,
  textStyle,
  containerStyle,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}の説明を表示`}
        onPress={() => setVisible(true)}
        style={containerStyle}
      >
        {/* テキストの下に余白を空けて下線を引く。負の marginBottom で
            paddingBottom + borderWidth 分を相殺し、セル全体の高さは元のラベル単独時から変えない。 */}
        <View style={styles.labelInline}>
          <Text style={textStyle}>{displayLabel ?? label}</Text>
        </View>
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleTitle}>{label}</Text>
              <Text style={styles.bubbleText}>{tooltip}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ラベルテキストの下に余白を空けて実線（solid）の下線を描画する。
  // dashed/dotted は React Native の border-bottom 単独だと描画が不安定なため solid を採用。
  // 負の marginBottom で paddingBottom(1) + borderBottomWidth(1) = 2px を相殺し、
  // ツールチップ付きセルとそうでないセルで高さが揃うようにする。
  labelInline: {
    paddingBottom: 1,
    marginBottom: -2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 212, 216, 0.5)",
  },
  // 親 overlay は alignItems を指定しない（stretch のまま）。
  // alignItems: "center" にすると alignSelf: auto の子は自然幅になり、
  // 「width: '100%'」を指定しても画面幅 1 行に伸びてテキストが折り返されない問題が起きる。
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  // bubble は overlay の利用可能幅にフィット（stretch）したうえで maxWidth で頭打ち、
  // alignSelf: 'center' で水平中央に揃える。これで Text が自動で折り返される。
  bubble: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  bubbleTitle: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  bubbleText: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 19,
  },
});
