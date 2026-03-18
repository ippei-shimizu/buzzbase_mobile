import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>最終更新日: 2026年3月15日</Text>

        <Section title="はじめに">
          BUZZ
          BASE（以下、「当サービス」とします）は、当サービスが運営するWebサービスおよびアプリケーション（以下、「本サービス」とします）において、お客様のプライバシーを尊重し、お客様から提供される個人情報の保護に努めています。本プライバシーポリシーは、本サービスを利用される際に、当サービスがどのような情報を収集し、その情報をどのように扱うかについて説明しています。
        </Section>

        <Section title="収集する情報">
          当サービスは、本サービスの提供、改善、お客様のサポートのために、以下の情報を収集することがあります。
          {"\n\n"}
          ・氏名（ニックネームも含む）{"\n"}
          ・メールアドレス{"\n"}
          ・写真{"\n"}
          ・Cookieを用いて生成された識別情報{"\n"}
          ・OSが生成するID、端末の種類、端末識別子等のお客様が利用するOSや端末に関する情報
          {"\n"}
          ・当サービスウェブサイトの滞在時間、入力履歴等の当サービスウェブサイトにおけるお客様の行動履歴
          {"\n"}
          ・当サービスアプリの起動時間、入力履歴等の当サービスアプリの利用履歴
        </Section>

        <Section title="利用目的">
          収集した情報は、以下の目的で利用されます。{"\n\n"}
          ・本サービスの提供と運営{"\n"}
          ・お客様からのお問い合わせへの対応{"\n"}
          ・本サービスの改善と開発{"\n"}
          ・新サービスの案内や更新情報の提供{"\n"}
          ・不正アクセスや不正利用の防止{"\n"}
          ・広告の配信および広告効果の測定
        </Section>

        <Section title="広告について">
          本サービスでは、第三者配信の広告サービス「Google
          AdSense」を利用しています。Google
          AdSenseでは、お客様の興味に応じた広告を表示するために、Cookie（クッキー）を使用することがあります。
          {"\n\n"}
          Cookieを使用することで、お客様のコンピュータやデバイスを識別できるようになりますが、お客様個人を特定できるものではありません。
          {"\n\n"}
          お客様はGoogleの広告設定ページから、パーソナライズド広告を無効にすることができます。また、aboutads.infoのページにアクセスすることで、パーソナライズド広告に使われる第三者配信事業者のCookieを無効にすることができます。
        </Section>

        <Section title="アクセス解析ツールについて">
          本サービスでは、Googleによるアクセス解析ツール「Google
          Analytics」を利用しています。Google
          Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          {"\n\n"}
          お客様はブラウザの設定でCookieを無効にすることで、これらの情報の収集を拒否することができます。
        </Section>

        <Section title="第三者への提供">
          当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。
          {"\n\n"}
          ・お客様の同意がある場合{"\n"}
          ・法令に基づく場合{"\n"}
          ・人の生命、身体または財産の保護のために必要がある場合であって、お客様の同意を得ることが困難であるとき
          {"\n"}
          ・本サービスの運営に必要な範囲で業務委託先に提供する場合（広告配信、アクセス解析等）
        </Section>

        <Section title="個人情報の安全管理">
          当サービスは、お客様の個人情報の漏洩、滅失またはき損の防止のために、適切なセキュリティ対策を実施し、個人情報の安全管理に努めます。
        </Section>

        <Section title="個人情報の開示・訂正・削除">
          お客様は、当サービスが保有するご自身の個人情報について、開示・訂正・削除を求めることができます。ご希望の場合は、下記のお問い合わせ先までご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。
        </Section>

        <Section title="お問い合わせ">
          本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでお願いいたします。
          {"\n\n"}
          Email: buzzbase.app@gmail.com
        </Section>

        <Section title="改訂">
          本プライバシーポリシーは、法令の変更や本サービスの変更に応じて、必要に応じて改訂されることがあります。改訂された場合は、本ページ上で更新日を変更してお知らせします。
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
  lastUpdated: {
    color: "#71717A",
    fontSize: 12,
    marginBottom: 16,
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
