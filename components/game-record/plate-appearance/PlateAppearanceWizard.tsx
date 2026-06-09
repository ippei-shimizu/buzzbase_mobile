import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import type {
  HitTypeOption,
  OutTypeOption,
  PlateResultId,
} from "@constants/plateResults";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HelpTooltipIcon } from "@components/ui/HelpTooltipIcon";
import {
  useCreatePlateAppearance,
  useUpdatePlateAppearance,
} from "@hooks/usePlateAppearances";
import {
  isBattingRecordReadyToSubmit,
  useBattingRecordStore,
} from "@stores/battingRecordStore";
import { useSnackbarStore } from "@stores/snackbarStore";
import { GroundTapField } from "./GroundTapField";
import { HitTypeModal } from "./HitTypeModal";
import { OutTypeModal } from "./OutTypeModal";
import { PlateResultButtons } from "./PlateResultButtons";
import { ScoreCounterInput } from "./ScoreCounterInput";

interface Props {
  /** API 送信先の試合 ID */
  gameResultId: number;
  /** 新規打席として採番する batter_box_number（リスト件数 + 1）。編集モードでも参考表示用に渡す */
  batterBoxNumber: number;
  /**
   * 編集モードのとき渡す既存打席。指定されると store に値を流し込み、
   * 完了時は PATCH /api/v2/plate_appearances/:id を呼ぶ。
   */
  editingPlateAppearance?: PlateAppearanceV2;
  /** 完了 / キャンセル後の遷移処理（典型的には router.back()） */
  onClose: () => void;
}

type WizardStep = "tap_and_select" | "counter";

/**
 * v2 打席記録のステップ式ウィザード本体（新規 / 編集 兼用）。
 *
 * - Step1 (`tap_and_select`): グラウンドタップ + 打席結果選択（必要に応じてサブモーダル）
 * - Step2 (`counter`): 打点 / 得点 / 盗塁 / 盗塁死を +/- で入力し、完了で API 送信
 *
 * 編集モードでは `editingPlateAppearance` を `initializeFromExisting` で store に流し込み、
 * 完了時に `updatePlateAppearance(id, payload)` を呼ぶ。
 * キャンセル時は API を呼ばずに `onClose` を呼ぶ（ローカル破棄）。
 */
export function PlateAppearanceWizard({
  gameResultId,
  batterBoxNumber,
  editingPlateAppearance,
  onClose,
}: Props) {
  const initializeForNew = useBattingRecordStore((s) => s.initializeForNew);
  const initializeFromExisting = useBattingRecordStore(
    (s) => s.initializeFromExisting,
  );
  const setHitLocation = useBattingRecordStore((s) => s.setHitLocation);
  const clearHitLocation = useBattingRecordStore((s) => s.clearHitLocation);
  const setPlateResult = useBattingRecordStore((s) => s.setPlateResult);
  const setCounter = useBattingRecordStore((s) => s.setCounter);
  const resetStore = useBattingRecordStore((s) => s.reset);
  const toCreatePayload = useBattingRecordStore((s) => s.toCreatePayload);

  const hitLocationX = useBattingRecordStore((s) => s.hitLocationX);
  const hitLocationY = useBattingRecordStore((s) => s.hitLocationY);
  const rbi = useBattingRecordStore((s) => s.rbi);
  const runScored = useBattingRecordStore((s) => s.runScored);
  const stolenBases = useBattingRecordStore((s) => s.stolenBases);
  const caughtStealing = useBattingRecordStore((s) => s.caughtStealing);

  const isEditMode = editingPlateAppearance !== undefined;
  const [step, setStep] = useState<WizardStep>("tap_and_select");
  const [outModalVisible, setOutModalVisible] = useState(false);
  const [hitModalVisible, setHitModalVisible] = useState(false);

  // 初期化はマウント時に 1 回だけ。レンダー中の setState を避けるため useEffect で実行。
  // アンマウント時（システムスワイプバック / 戻るジェスチャー / 完了後の router.back いずれも）に
  // store をリセットして、次回ウィザード起動時に前回の入力値が残らないようにする。
  // 完了経路では handleSubmit 内でも resetStore を呼ぶが、reset は冪等なので二重実行しても問題ない。

  useEffect(() => {
    if (editingPlateAppearance) {
      initializeFromExisting(editingPlateAppearance);
    } else {
      initializeForNew(batterBoxNumber);
    }
    return () => {
      resetStore();
    };
  }, []);

  const { createPlateAppearance, isCreating } = useCreatePlateAppearance();
  const { updatePlateAppearance, isUpdating } = useUpdatePlateAppearance();
  const isSubmitting = isCreating || isUpdating;

  const hitLocation =
    hitLocationX !== null && hitLocationY !== null
      ? { x: hitLocationX, y: hitLocationY }
      : null;

  const handleTap = (args: {
    x: number;
    y: number;
    directionId: number | null;
    depthId: number | null;
  }) => {
    setHitLocation(args.x, args.y, args.directionId, args.depthId);
  };

  const proceedToCounter = (
    resultId: PlateResultId,
    options?: {
      outType?: OutTypeOption["out_type"];
      hitType?: HitTypeOption["hit_type"];
    },
  ) => {
    setPlateResult(resultId, options);
    setStep("counter");
  };

  const handleSubmit = async () => {
    const state = useBattingRecordStore.getState();
    if (!isBattingRecordReadyToSubmit(state)) {
      useSnackbarStore.getState().show({
        type: "error",
        message: "打席結果が選ばれていません",
      });
      return;
    }
    try {
      const payload = toCreatePayload(gameResultId);
      if (editingPlateAppearance) {
        await updatePlateAppearance({
          id: editingPlateAppearance.id,
          payload,
        });
      } else {
        await createPlateAppearance(payload);
      }
      resetStore();
      onClose();
    } catch (error) {
      useSnackbarStore.getState().show({
        type: "error",
        message:
          error instanceof Error ? error.message : "打席の保存に失敗しました",
      });
    }
  };

  const headerTitle = isEditMode
    ? `第${batterBoxNumber}打席を編集`
    : `第${batterBoxNumber}打席`;
  const completeLabel = isEditMode ? "この打席を更新" : "この打席を完了";
  const cancelLabel = isEditMode ? "編集を中断する" : "入力を中断する";

  if (step === "counter") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.body}>
        <Text style={styles.stepHeader}>{headerTitle}の入力</Text>
        <ScoreCounterInput
          rbi={rbi}
          runScored={runScored}
          stolenBases={stolenBases}
          caughtStealing={caughtStealing}
          onChange={setCounter}
        />
        <View style={styles.counterActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="打席結果の選択に戻る"
            style={styles.secondaryButton}
            onPress={() => setStep("tap_and_select")}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryLabel}>結果選択に戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={completeLabel}
            accessibilityState={{ disabled: isSubmitting }}
            style={[
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#F4F4F4" />
            ) : (
              <Text style={styles.primaryLabel}>{completeLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <View style={styles.stepHeaderRow}>
        <Text style={styles.stepHeader}>{headerTitle}</Text>
        <HelpTooltipIcon
          title="入力方法"
          message={
            "グラウンドをタップして打球方向を選んでから、下のボタンで結果を選択してください。\n\n" +
            "三振・四球など打球方向のない結果は、タップせずに「打球方向なし」のボタンから選べます。"
          }
        />
      </View>
      <GroundTapField hitLocation={hitLocation} onTap={handleTap} />
      <View style={styles.clearLocationSlot}>
        {hitLocation !== null && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="打球方向をクリア"
            onPress={clearHitLocation}
            style={styles.clearLocationButton}
          >
            <Ionicons name="close-circle" size={16} color="#A1A1AA" />
            <Text style={styles.clearLocationLabel}>打球方向をクリア</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.buttonsSection}>
        <PlateResultButtons
          hasHitLocation={hitLocation !== null}
          onSelectNoDirection={(resultId) => proceedToCounter(resultId)}
          onSelectOut={() => setOutModalVisible(true)}
          onSelectHit={() => setHitModalVisible(true)}
          onSelectDirectionOnly={(resultId) => proceedToCounter(resultId)}
        />
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        style={styles.cancelButton}
        onPress={() => {
          resetStore();
          onClose();
        }}
      >
        <Text style={styles.cancelLabel}>{cancelLabel}</Text>
      </TouchableOpacity>

      <OutTypeModal
        visible={outModalVisible}
        onSelect={(option) => {
          setOutModalVisible(false);
          proceedToCounter(option.plate_result_id, {
            outType: option.out_type,
          });
        }}
        onCancel={() => setOutModalVisible(false)}
      />
      <HitTypeModal
        visible={hitModalVisible}
        onSelect={(option) => {
          setHitModalVisible(false);
          proceedToCounter(option.plate_result_id, {
            hitType: option.hit_type,
          });
        }}
        onCancel={() => setHitModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  body: {
    padding: 16,
    paddingBottom: 64,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  stepHeader: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  buttonsSection: {
    marginTop: 16,
  },
  clearLocationSlot: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  clearLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearLocationLabel: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  counterActions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryLabel: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d08000",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryLabel: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
