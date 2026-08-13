import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function LicensesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lead}>
          BUZZ
          BASEでは、以下のオープンソースソフトウェアおよび素材を利用しています。
        </Text>

        <Section title="Solar Icons">
          制作: 480 Design{"\n"}
          ライセンス: Creative Commons Attribution 4.0 International (CC BY 4.0)
          {"\n"}
          ライセンス全文: https://creativecommons.org/licenses/by/4.0/{"\n"}
          配布元: https://icon-sets.iconify.design/solar/{"\n\n"}
          本アプリでは、Solar Iconsの一部をReact
          Native向けのコンポーネントに変換して利用しています（改変あり）。
        </Section>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  lead: {
    color: "#D4D4D8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: "#D4D4D8",
    fontSize: 14,
    lineHeight: 22,
  },
});
