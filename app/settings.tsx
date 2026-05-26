import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { DangerActionButton } from "@components/profile/DangerActionButton";
import {
  SettingsSection,
  type SettingsItem,
} from "@components/profile/SettingsSection";
import { useAuth } from "@hooks/useAuth";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useStoreReview } from "@hooks/useStoreReview";

interface SettingsSectionData {
  title: string;
  items: SettingsItem[];
}

/**
 * 設定画面（ルート配置）。各タブから push しても遷移元タブに戻れるよう、
 * `app/_layout.tsx` の Stack 直下に置いている。
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { openStoreReviewPage } = useStoreReview();
  const { enabled: proFeatures } = useFeatureFlag("pro_features");

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const accountItems: SettingsItem[] = [
    {
      icon: "person-outline",
      title: "プロフィール編集",
      description: "アカウントの公開設定・名前・チーム・ポジションなどを変更",
      onPress: () => router.push("/(profile)/edit"),
    },
  ];

  if (proFeatures) {
    // TODO: Pro プラン動線の仮実装。リリース前に下記を磨き込む:
    //   - 加入済み / 未加入で表示文言とアイコンを切り替える（useProStatus 連携）
    //   - 加入済みなら「Pro プランを見る」項目自体を非表示にする等の UX 調整
    //   - SettingsSection のアイコン・カラーを Pro ブランディングに合わせる
    accountItems.push({
      icon: "star-outline",
      title: "Pro プランを見る",
      description: "全機能を解放する Pro プランの詳細を確認",
      onPress: () => router.push("/pro"),
    });
    accountItems.push({
      icon: "card-outline",
      title: "サブスクリプション管理",
      description: "Pro プランの加入状態・解約方法を確認",
      onPress: () => router.push("/account/subscription"),
    });
  }

  const sections: SettingsSectionData[] = [
    {
      title: "アカウント",
      items: accountItems,
    },
    {
      title: "ヘルプ",
      items: [
        {
          icon: "calculator-outline",
          title: "成績の算出方法",
          description: "打率・防御率などの計算方法について",
          onPress: () => router.push("/(profile)/calculation-of-grades"),
        },
      ],
    },
    {
      title: "その他",
      items: [
        {
          icon: "star-outline",
          title: "レビューで応援する",
          description: "ストアでレビューを貰えると泣いて喜びます",
          onPress: () => {
            void openStoreReviewPage();
          },
        },
        {
          icon: "mail-outline",
          title: "お問い合わせ",
          description: "ご意見・不具合の報告など",
          onPress: () => router.push("/(profile)/contact"),
        },
        {
          icon: "shield-outline",
          title: "プライバシーポリシー",
          description: "個人情報の取り扱いについて",
          onPress: () => router.push("/(profile)/privacy-policy"),
        },
        {
          icon: "document-text-outline",
          title: "利用規約",
          description: "サービスの利用条件について",
          onPress: () => router.push("/(profile)/terms-of-service"),
        },
      ],
    },
  ];

  const version = Constants.expoConfig?.version ?? "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sections.map((section) => (
        <SettingsSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}

      <View style={styles.dangerZone}>
        <DangerActionButton
          label="ログアウト"
          variant="filled"
          onPress={handleLogout}
        />
        <DangerActionButton
          label="アカウント削除"
          variant="outline"
          onPress={() => router.push("/(profile)/account-deletion")}
          style={styles.outlineSpacing}
        />
        {version ? (
          <Text style={styles.version}>バージョン {version}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    paddingBottom: 48,
  },
  dangerZone: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  outlineSpacing: {
    marginTop: 12,
  },
  version: {
    color: "#71717A",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
});
