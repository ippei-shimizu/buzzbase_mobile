import type { PitcherInput, ThrowHand } from "../../../../types/pitcher";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreatePitcher } from "@hooks/usePitchers";
import {
  useArmAngles,
  usePitcherStyles,
  useVelocityZones,
} from "@hooks/usePlateAppearanceMasters";

interface Props {
  visible: boolean;
  onCreated: (pitcherId: number) => void;
  onCancel: () => void;
}

interface ThrowHandOption {
  value: ThrowHand;
  label: string;
}

const THROW_HAND_OPTIONS: ThrowHandOption[] = [
  { value: "right", label: "右投げ" },
  { value: "left", label: "左投げ" },
];

/**
 * 相手投手を新規登録するモーダル。
 * 必須は投手名のみ。利き手・腕の角度・球速帯・投手タイプは任意。
 *
 * 作成成功時は新規投手 ID を `onCreated` に渡す。呼び出し側は
 * その ID を store の `pitcherId` に流して打席に紐付ける。
 */
export function PitcherFormModal({ visible, onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [throwHand, setThrowHand] = useState<ThrowHand | null>(null);
  const [armAngleId, setArmAngleId] = useState<number | null>(null);
  const [velocityZoneId, setVelocityZoneId] = useState<number | null>(null);
  const [pitcherStyleId, setPitcherStyleId] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const armAngles = useArmAngles();
  const velocityZones = useVelocityZones();
  const pitcherStyles = usePitcherStyles();
  const { createPitcher, isCreating } = useCreatePitcher();

  const reset = () => {
    setName("");
    setThrowHand(null);
    setArmAngleId(null);
    setVelocityZoneId(null);
    setPitcherStyleId(null);
    setMemo("");
    setErrorMessage(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSubmit = async () => {
    if (name.trim().length === 0) {
      setErrorMessage("投手名を入力してください");
      return;
    }
    setErrorMessage(null);

    const payload: PitcherInput = {
      name: name.trim(),
      throw_hand: throwHand,
      arm_angle_id: armAngleId,
      velocity_zone_id: velocityZoneId,
      pitcher_style_id: pitcherStyleId,
      memo: memo.trim().length === 0 ? null : memo.trim(),
    };

    try {
      const created = await createPitcher(payload);
      reset();
      onCreated(created.id);
    } catch {
      setErrorMessage("投手の登録に失敗しました。時間を置いて試してください");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleCancel}
        accessible={false}
      >
        <Pressable
          style={styles.sheet}
          onPress={(event) => event.stopPropagation()}
          accessible={false}
        >
          <Text style={styles.title}>相手投手を追加</Text>
          <ScrollView contentContainerStyle={styles.body}>
            <Field label="投手名（必須）">
              <RNTextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="例: 田中投手"
                placeholderTextColor="#71717A"
                accessibilityLabel="投手名"
                maxLength={100}
              />
            </Field>

            <Field label="利き手">
              <ChipRow>
                {THROW_HAND_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    selected={throwHand === option.value}
                    onPress={() =>
                      setThrowHand(
                        throwHand === option.value ? null : option.value,
                      )
                    }
                  />
                ))}
              </ChipRow>
            </Field>

            <MasterField
              label="腕の角度"
              options={armAngles.armAngles}
              value={armAngleId}
              onChange={setArmAngleId}
              isLoading={armAngles.isLoading}
            />
            <MasterField
              label="球速帯"
              options={velocityZones.velocityZones}
              value={velocityZoneId}
              onChange={setVelocityZoneId}
              isLoading={velocityZones.isLoading}
            />
            <MasterField
              label="投手タイプ"
              options={pitcherStyles.pitcherStyles}
              value={pitcherStyleId}
              onChange={setPitcherStyleId}
              isLoading={pitcherStyles.isLoading}
            />

            <Field label="メモ（配球傾向・特徴など）">
              <RNTextInput
                style={[styles.textInput, styles.textArea]}
                value={memo}
                onChangeText={setMemo}
                placeholder="例: 初球はストレート / 決め球は外角スライダー"
                placeholderTextColor="#71717A"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
                accessibilityLabel="投手メモ"
              />
            </Field>

            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="投手登録をキャンセル"
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isCreating}
            >
              <Text style={styles.cancelLabel}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="投手を登録"
              accessibilityState={{ disabled: isCreating }}
              style={[styles.submitButton, isCreating && styles.disabled]}
              onPress={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#F4F4F4" />
              ) : (
                <Text style={styles.submitLabel}>登録</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function SelectChip({ label, selected, onPress }: SelectChipProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface MasterFieldProps {
  label: string;
  options: { id: number; name: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
  isLoading: boolean;
}

function MasterField({
  label,
  options,
  value,
  onChange,
  isLoading,
}: MasterFieldProps) {
  return (
    <Field label={label}>
      {isLoading ? (
        <ActivityIndicator color="#d08000" />
      ) : (
        <ChipRow>
          {options.map((option) => (
            <SelectChip
              key={option.id}
              label={option.name}
              selected={value === option.id}
              onPress={() => onChange(value === option.id ? null : option.id)}
            />
          ))}
        </ChipRow>
      )}
    </Field>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    maxHeight: "85%",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    paddingBottom: 8,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 14,
  },
  textArea: {
    minHeight: 88,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
  },
  chipSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  chipText: {
    color: "#F4F4F4",
    fontSize: 13,
  },
  chipTextSelected: {
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#52525B",
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: "#F08080",
    fontSize: 13,
    marginTop: 4,
  },
});
