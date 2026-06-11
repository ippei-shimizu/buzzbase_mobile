import type { PlateAppearanceV2 } from "../../../types/plateAppearance";
import type {
  HitTypeOption,
  OutTypeOption,
  PlateResultId,
} from "@constants/plateResults";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
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
import { DetailDataForm } from "./detail/DetailDataForm";
import { EditTabBar } from "./EditTabBar";
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

type WizardStep = "tap_and_select" | "counter" | "detail";

/**
 * v2 打席記録のステップ式ウィザード本体（新規 / 編集 兼用）。
 *
 * - Step1 (`tap_and_select`): グラウンドタップ + 打席結果選択（必要に応じてサブモーダル）
 * - Step2 (`counter`): 打点 / 得点 / 盗塁 / 盗塁死を +/- で入力
 * - Step3 (`detail`): 任意の詳細データ（カウント / ランナー / 球質 / 球種 / メモ等）
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
  const navigation = useNavigation();
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
  // タブの入力済みドット表示用。zustand セレクタは毎レンダーで新規オブジェクトを
  // 返すと無限ループになるため、boolean に集約してから取得する。
  const plateResultIdValue = useBattingRecordStore((s) => s.plateResultId);
  const hasDetailInputFromStore = useBattingRecordStore(
    (s) =>
      s.finalBalls !== null ||
      s.finalStrikes !== null ||
      s.finalOuts !== null ||
      s.firstPitchSwing !== null ||
      s.runnersState !== null ||
      s.inning !== null ||
      s.contactQualityId !== null ||
      s.timingId !== null ||
      s.pitchTypeId !== null ||
      s.pitcherId !== null ||
      s.appearanceSituationId !== null ||
      (s.selfAnalysisMemo !== null && s.selfAnalysisMemo !== ""),
  );

  const isEditMode = editingPlateAppearance !== undefined;
  // 編集モードは「打点・得点」タブから開始する（一番使用頻度が高そうな項目）。
  // 新規モードは従来どおりタップ → 結果選択から始める。
  const [step, setStep] = useState<WizardStep>(
    isEditMode ? "counter" : "tap_and_select",
  );
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
    // マウント 1 回限りの初期化と、アンマウント時のリセットだけが意図。
    // 依存配列に setter / props を入れると意味が変わるため敢えて空にする。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stack ヘッダーの戻るボタン挙動を制御。
  // - 新規モードの Step2/Step3: 1 つ前のステップに戻す
  // - 新規モードの Step1: デフォルト（打席一覧へ pop）
  // - 編集モード: 常にデフォルト（打席一覧へ pop）。タブで自由に切り替えられるため
  //   「前ステップに戻る」概念は不要。
  useLayoutEffect(() => {
    if (isEditMode) {
      navigation.setOptions({ headerLeft: undefined });
      return;
    }
    if (step === "counter") {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="打席結果の選択に戻る"
            onPress={() => setStep("tap_and_select")}
            style={styles.headerBack}
            hitSlop={6}
          >
            <Ionicons name="chevron-back" size={28} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      });
    } else if (step === "detail") {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="打点・盗塁の入力に戻る"
            onPress={() => setStep("counter")}
            style={styles.headerBack}
            hitSlop={6}
          >
            <Ionicons name="chevron-back" size={28} color="#F4F4F4" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({ headerLeft: undefined });
    }
  }, [step, navigation, isEditMode]);

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
    // 編集モードはタブで自由に切り替えるため、結果選択での自動遷移は抑制する。
    if (!isEditMode) setStep("counter");
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

  const hasResultInput = plateResultIdValue !== null;
  const hasScoreInput =
    rbi > 0 || runScored > 0 || stolenBases > 0 || caughtStealing > 0;
  const hasDetailInput = hasDetailInputFromStore;

  const renderEditTabBar = () =>
    isEditMode ? (
      <EditTabBar
        current={step}
        onChange={setStep}
        hasResult={hasResultInput}
        hasScore={hasScoreInput}
        hasDetail={hasDetailInput}
      />
    ) : null;

  const renderEditFooter = () =>
    isEditMode ? (
      <View style={styles.counterActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={completeLabel}
          accessibilityState={{ disabled: isSubmitting }}
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
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
    ) : null;

  if (step === "detail") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.body}>
        {renderEditTabBar()}
        {!isEditMode && (
          <View style={styles.detailHeaderRow}>
            <Text style={styles.stepHeader}>
              {headerTitle}の詳細（すべて任意）
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="詳細入力をスキップして完了"
              onPress={handleSubmit}
              disabled={isSubmitting}
              hitSlop={6}
            >
              <Text style={styles.skipLabel}>スキップして完了</Text>
            </TouchableOpacity>
          </View>
        )}
        <DetailDataForm />
        {isEditMode ? (
          renderEditFooter()
        ) : (
          <View style={styles.counterActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="打点・盗塁の入力に戻る"
              style={styles.secondaryButton}
              onPress={() => setStep("counter")}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryLabel}>打点・盗塁の入力に戻る</Text>
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
        )}
      </ScrollView>
    );
  }

  if (step === "counter") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.body}>
        {renderEditTabBar()}
        {!isEditMode && (
          <Text style={styles.stepHeader}>{headerTitle}の入力</Text>
        )}
        <ScoreCounterInput
          rbi={rbi}
          runScored={runScored}
          stolenBases={stolenBases}
          caughtStealing={caughtStealing}
          onChange={setCounter}
        />
        {isEditMode ? (
          renderEditFooter()
        ) : (
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
              accessibilityLabel="詳細を入力する"
              style={styles.primaryButton}
              onPress={() => setStep("detail")}
              disabled={isSubmitting}
            >
              <View style={styles.primaryButtonInner}>
                <Text style={styles.primaryLabel}>詳細を入力する</Text>
                <Ionicons name="chevron-forward" size={20} color="#F4F4F4" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="詳細入力をスキップして完了"
              accessibilityState={{ disabled: isSubmitting }}
              style={[
                styles.skipFinishButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#d08000" />
              ) : (
                <Text style={styles.skipFinishLabel}>スキップして完了</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      {renderEditTabBar()}
      {!isEditMode && (
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
      )}
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
      {isEditMode ? (
        renderEditFooter()
      ) : (
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
      )}

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
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  skipLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  headerBack: {
    paddingLeft: 0,
    paddingRight: 12,
    paddingVertical: 4,
    marginLeft: -8,
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
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  skipFinishButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipFinishLabel: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
