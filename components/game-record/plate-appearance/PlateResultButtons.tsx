import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  DIRECTION_ONLY_RESULT_OPTIONS,
  NO_DIRECTION_RESULT_OPTIONS,
  type PlateResultId,
} from "@constants/plateResults";

interface Props {
  /** グラウンドタップ済みか（true なら打球方向あり系のボタンを活性にする） */
  hasHitLocation: boolean;
  /** 三振 / 四球 / 死球 / 打撃妨害 / 振り逃げ を選んだとき */
  onSelectNoDirection: (plateResultId: PlateResultId) => void;
  /** アウトボタンを押したとき。呼び出し側で OutTypeModal を開く */
  onSelectOut: () => void;
  /** ヒットボタンを押したとき。呼び出し側で HitTypeModal を開く */
  onSelectHit: () => void;
  /** 失策 / FC / 犠打 / 犠飛 を選んだとき */
  onSelectDirectionOnly: (plateResultId: PlateResultId) => void;
}

const PRIMARY_COLOR = "#d08000";
const TEXT_COLOR = "#F4F4F4";
const DISABLED_OPACITY = 0.4;

/** 配列を 2 要素ずつのチャンクに分割する。 */
const chunkPairs = <T,>(items: readonly T[]): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    result.push(items.slice(i, i + 2));
  }
  return result;
};

/**
 * 打席結果ボタングループ。
 * 上段: グラウンドタップ済みのときに活性化する「アウト / ヒット / 失策 / FC / 犠打 / 犠飛」。
 * 下段: タップ不要の「空振り三振 / 見逃し三振 / 振り逃げ / 四球 / 死球 / 打撃妨害」。
 *
 * タップ有無で活性／非活性を切り替えるだけで、結果確定は親コンポーネントに委ねる
 * （アウト / ヒットはサブ選択モーダルの起動 callback、それ以外は plate_result_id を直接渡す）。
 */
export function PlateResultButtons({
  hasHitLocation,
  onSelectNoDirection,
  onSelectOut,
  onSelectHit,
  onSelectDirectionOnly,
}: Props) {
  return (
    <View>
      <View style={styles.section}>
        <View style={styles.row}>
          <ResultButton
            label="アウト"
            disabled={!hasHitLocation}
            onPress={onSelectOut}
          />
          <ResultButton
            label="ヒット"
            disabled={!hasHitLocation}
            onPress={onSelectHit}
          />
        </View>
        <View style={styles.row}>
          {DIRECTION_ONLY_RESULT_OPTIONS.map((option) => (
            <ResultButton
              key={option.plate_result_id}
              label={option.label}
              disabled={!hasHitLocation}
              onPress={() => onSelectDirectionOnly(option.plate_result_id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>打球方向なし</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        {chunkPairs(NO_DIRECTION_RESULT_OPTIONS).map((row, rowIndex) => (
          <View key={`no-direction-row-${rowIndex}`} style={styles.row}>
            {row.map((option, idx) => (
              <ResultButton
                key={`${option.plate_result_id}-${option.label}-${idx}`}
                label={option.label}
                disabled={hasHitLocation}
                onPress={() => onSelectNoDirection(option.plate_result_id)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

interface ResultButtonProps {
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function ResultButton({ label, disabled, onPress }: ResultButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  buttonLabel: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#52525B",
  },
  dividerLabel: {
    color: TEXT_COLOR,
    fontSize: 13,
  },
});
