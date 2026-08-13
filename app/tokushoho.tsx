import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

export default function TokushohoScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.intro}>
          「BUZZ
          BASE」の有料プラン（Proプラン）は、特定商取引法第11条（通信販売についての広告）に基づき、以下のとおり表示します。
        </Text>

        <Item title="販売事業者">清水一平</Item>

        <Item title="運営統括責任者">清水一平</Item>

        <Item title="所在地">
          ご請求をいただいた場合、遅滞なく開示いたします。
        </Item>

        <Item title="電話番号">
          ご請求をいただいた場合、遅滞なく開示いたします。
        </Item>

        <Item title="メールアドレス">buzzbase.app@gmail.com</Item>

        <Item title="販売価格">
          月額プラン ¥480（税込）／月、年額プラン
          ¥4,800（税込）／年（月あたり¥400相当）。7日間の無料トライアルがあります。詳細は
          <Text
            style={styles.link}
            onPress={() => router.push("/pro")}
            accessibilityRole="link"
          >
            Proプランのご案内
          </Text>
          画面をご確認ください。
        </Item>

        <Item title="商品代金以外の必要料金">
          本サービスのご利用にかかる通信費はお客様のご負担となります。
        </Item>

        <Item title="支払方法">
          クレジットカード決済（Stripe、Web版）、Apple
          ID決済（iOSアプリ内課金、RevenueCat経由）。
        </Item>

        <Item title="支払時期">
          クレジットカード決済は申込手続完了時に即時課金されます。Apple
          ID決済はApple社の定める時期に準じます。
        </Item>

        <Item title="引渡時期">申込手続完了後、直ちにご利用いただけます。</Item>

        <Item title="返品・キャンセル・返金">
          商品の性質上、原則として返金には応じられません。ただし無料トライアル期間中に解約手続を行った場合は課金が発生しないため、料金は一切かかりません。Apple
          ID（App
          Store）決済分の返金については、Appleの定める規約及び手続に従うものとし、当社は返金可否を判断する権限を有しません。
        </Item>

        <Item title="解約方法">
          Web版は「設定」のサブスクリプション画面からいつでも解約できます。iOS版はApple
          ID（App
          Store）のサブスクリプション設定画面から解約してください（当社側で直接操作することはできません）。
        </Item>

        <Text style={styles.footer}>以上</Text>
      </View>
    </ScrollView>
  );
}

function Item({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{title}</Text>
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
  intro: {
    color: "#D4D4D8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  item: {
    marginBottom: 20,
  },
  itemTitle: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  body: {
    color: "#D4D4D8",
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    color: "#60A5FA",
    textDecorationLine: "underline",
  },
  footer: {
    color: "#71717A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
});
