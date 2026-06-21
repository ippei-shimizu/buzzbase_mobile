import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { Button } from "@components/ui/Button";

type WelcomeCardVariant = "record" | "invite";

interface WelcomeCardProps {
  variant: WelcomeCardVariant;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const CONTENT: Record<
  WelcomeCardVariant,
  { title: string; description: string; cta: string }
> = {
  record: {
    title: "BUZZ BASEへようこそ",
    description:
      "試合を記録するだけで、打率・OPS から防御率まで自動で計算。打者も投手もまとめて成績を管理できます。",
    cta: "最初の試合を記録する",
  },
  invite: {
    title: "チームメイトと競い合おう",
    description: "グループを作って、打率ランキングで仲間と競おう。",
    cta: "友達を招待する",
  },
};

const SampleStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statChip}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatsPreview = () => (
  <View style={styles.preview}>
    <Text style={styles.previewCaption}>記録するとこう計算されます</Text>
    <Text style={styles.groupLabel}>打撃成績</Text>
    <View style={styles.statsRow}>
      <SampleStat label="打率" value=".333" />
      <SampleStat label="OPS" value=".900" />
      <SampleStat label="本塁打" value="5" />
    </View>
    <Text style={[styles.groupLabel, styles.groupLabelSpacing]}>投手成績</Text>
    <View style={styles.statsRow}>
      <SampleStat label="防御率" value="2.50" />
      <SampleStat label="奪三振" value="42" />
      <SampleStat label="勝利" value="6" />
    </View>
    <Text style={styles.previewNote}>※サンプル</Text>
  </View>
);

const SampleRankRow = ({ rank, value }: { rank: number; value: string }) => (
  <View style={styles.rankRow}>
    <View style={styles.rankBadge}>
      <Text style={styles.rankBadgeText}>{rank}</Text>
    </View>
    <View style={styles.rankNamePlaceholder} />
    <Text style={styles.rankValue}>{value}</Text>
  </View>
);

const RankingPreview = () => (
  <View style={styles.preview}>
    <Text style={styles.previewCaption}>グループ内ランキング</Text>
    <SampleRankRow rank={1} value=".380" />
    <SampleRankRow rank={2} value=".355" />
    <SampleRankRow rank={3} value=".340" />
    <Text style={styles.previewNote}>※サンプル</Text>
  </View>
);

export const WelcomeCard = ({
  variant,
  onPress,
  style,
  disabled,
}: WelcomeCardProps) => {
  const content = CONTENT[variant];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>

      {variant === "record" ? <StatsPreview /> : <RankingPreview />}

      <Button
        title={content.cta}
        onPress={onPress}
        style={styles.cta}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#424242",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: "#A1A1AA",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  preview: {
    backgroundColor: "#1f1f22",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  previewCaption: {
    color: "#71717A",
    fontSize: 12,
    marginBottom: 10,
  },
  groupLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  groupLabelSpacing: {
    marginTop: 12,
  },
  previewNote: {
    color: "#52525b",
    fontSize: 10,
    marginTop: 8,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: "#27272a",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  statValue: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankBadgeText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "700",
  },
  rankNamePlaceholder: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3f3f46",
    marginRight: 10,
  },
  rankValue: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "700",
  },
  cta: {
    marginTop: 20,
    alignSelf: "stretch",
  },
});
