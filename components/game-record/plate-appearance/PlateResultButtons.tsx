import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  DIRECTION_ONLY_RESULT_OPTIONS,
  HIT_TYPE_OPTIONS,
  NO_DIRECTION_RESULT_OPTIONS,
  OUT_TYPE_OPTIONS,
  PLATE_RESULT_IDS,
  type PlateResultId,
} from "@constants/plateResults";

interface Props {
  /** グラウンドタップ済みか（true なら打球方向あり系のボタンを活性にする） */
  hasHitLocation: boolean;
  /**
   * 現在選択中の打席結果 ID。編集モードや結果選択後の再表示でハイライト用に使う。
   * null/undefined のときはどのボタンもハイライトされない。
   */
  selectedPlateResultId?: PlateResultId | null;
  /** 三振 / 四球 / 死球 / 打撃妨害 / 振り逃げ を選んだとき */
  onSelectNoDirection: (plateResultId: PlateResultId) => void;
  /** アウトボタンを押したとき。呼び出し側で OutTypeModal を開く */
  onSelectOut: () => void;
  /** ヒットボタンを押したとき。呼び出し側で HitTypeModal を開く */
  onSelectHit: () => void;
  /** 失策 / FC / 犠打 / 犠飛 を選んだとき */
  onSelectDirectionOnly: (plateResultId: PlateResultId) => void;
}

const OUT_PLATE_RESULT_IDS: readonly PlateResultId[] = OUT_TYPE_OPTIONS.map(
  (option) => option.plate_result_id,
);
const HIT_PLATE_RESULT_IDS: readonly PlateResultId[] = HIT_TYPE_OPTIONS.map(
  (option) => option.plate_result_id,
);

const PRIMARY_COLOR = "#d08000";
const OUT_COLOR = "#ef4444";
const TEXT_COLOR = "#F4F4F4";
const DISABLED_OPACITY = 0.4;

type Tone = "primary" | "out";

const TONE_COLORS: Record<Tone, string> = {
  primary: PRIMARY_COLOR,
  out: OUT_COLOR,
};

/**
 * `plate_result_id` から tone を導出する。
 * out 系（赤）は「打者の打撃結果が失敗」のもの。
 * 犠打 / 犠飛は打数除外でチーム貢献度の高いプレーなので primary 側（オレンジ）に含める。
 * 失策 / 野選は出塁が打者の打撃結果ではなく相手のミスなので primary 扱い。
 * 振り逃げは出塁できるが三振が前提（打撃としては失敗）なので out 扱い。
 */
const toneForPlateResult = (id: PlateResultId): Tone => {
  switch (id) {
    case PLATE_RESULT_IDS.STRIKEOUT:
    case PLATE_RESULT_IDS.STRIKEOUT_REACHED:
    case PLATE_RESULT_IDS.GROUND_OUT:
    case PLATE_RESULT_IDS.FLY_OUT:
    case PLATE_RESULT_IDS.LINE_OUT:
    case PLATE_RESULT_IDS.FOUL_FLY:
    case PLATE_RESULT_IDS.DOUBLE_PLAY:
      return "out";
    default:
      return "primary";
  }
};

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
 * 上段: グラウンドタップ済みのときに活性化する「アウト / ヒット / 失策 / 野選 / 犠打 / 犠飛」。
 * 下段: タップ不要の「空振り三振 / 見逃し三振 / 振り逃げ / 四球 / 死球 / 打撃妨害」。
 *
 * 「アウト」「ヒット」はサブ種別モーダルを開くので右に chevron を表示し、
 * 「次のステップがあるボタン」を視覚的に区別する。それ以外は単発タップで確定。
 *
 * 出塁できる結果は primary（オレンジ）、アウトになる結果は out（赤）で枠とラベルを色分けし、
 * 結果カテゴリを瞬時に判別できるようにする。
 */
export function PlateResultButtons({
  hasHitLocation,
  selectedPlateResultId = null,
  onSelectNoDirection,
  onSelectOut,
  onSelectHit,
  onSelectDirectionOnly,
}: Props) {
  const isOutSelected =
    selectedPlateResultId !== null &&
    OUT_PLATE_RESULT_IDS.includes(selectedPlateResultId);
  const isHitSelected =
    selectedPlateResultId !== null &&
    HIT_PLATE_RESULT_IDS.includes(selectedPlateResultId);
  return (
    <View>
      <View style={styles.section}>
        <View style={styles.row}>
          <ResultButton
            label="アウト"
            tone="out"
            disabled={!hasHitLocation}
            onPress={onSelectOut}
            hasChevron
            isSelected={isOutSelected}
          />
          <ResultButton
            label="ヒット"
            tone="primary"
            disabled={!hasHitLocation}
            onPress={onSelectHit}
            hasChevron
            isSelected={isHitSelected}
          />
        </View>
        <View style={styles.row}>
          {DIRECTION_ONLY_RESULT_OPTIONS.map((option) => (
            <ResultButton
              key={option.plate_result_id}
              label={option.label}
              tone={toneForPlateResult(option.plate_result_id)}
              disabled={!hasHitLocation}
              onPress={() => onSelectDirectionOnly(option.plate_result_id)}
              isSelected={selectedPlateResultId === option.plate_result_id}
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
            {row.map((option) => (
              <ResultButton
                key={`${option.plate_result_id}-${option.label}`}
                label={option.label}
                tone={toneForPlateResult(option.plate_result_id)}
                disabled={hasHitLocation}
                onPress={() => onSelectNoDirection(option.plate_result_id)}
                isSelected={selectedPlateResultId === option.plate_result_id}
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
  /** サブ選択モーダルを開くボタンに右端へ chevron を表示する */
  hasChevron?: boolean;
  /** 配色トーン。出塁系 = primary（オレンジ）、アウト系 = out（赤） */
  tone?: Tone;
  /** 現在選択中のボタンを背景塗りつぶし + 左にチェックアイコンで強調する */
  isSelected?: boolean;
}

function ResultButton({
  label,
  disabled,
  onPress,
  hasChevron,
  tone = "primary",
  isSelected = false,
}: ResultButtonProps) {
  const color = TONE_COLORS[tone];
  const labelColor = isSelected ? "#FFFFFF" : color;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        { borderColor: color },
        isSelected && { backgroundColor: color },
        disabled && styles.buttonDisabled,
      ]}
    >
      {isSelected && (
        <View style={styles.checkmark} pointerEvents="none">
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        </View>
      )}
      <Text style={[styles.buttonLabel, { color: labelColor }]}>{label}</Text>
      {hasChevron && (
        <View style={styles.chevron} pointerEvents="none">
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isSelected ? "#FFFFFF" : color}
          />
        </View>
      )}
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
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  buttonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  chevron: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  checkmark: {
    position: "absolute",
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
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
