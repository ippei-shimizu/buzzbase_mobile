# EAS Build セットアップ手順

BUZZ BASE Pro（iOS In-App Purchase）リリース向けの EAS Build / TestFlight / RevenueCat セットアップ手順をまとめる。

## 前提

- Apple Developer Program に加入済み（年 $99）
- RevenueCat アカウント作成済み（無料プランで OK）
- macOS で Xcode インストール済み（Sandbox テスター動作確認時に必要）
- `mobile/` ディレクトリで `yarn install` 完了

## 1. EAS CLI セットアップ

```bash
npm install -g eas-cli
eas login
```

プロジェクトは初期化済み（`app.json` 内 `extra.eas.projectId = 5050600e-3931-4806-b632-43cc204134ae`）。新規初期化は不要。

確認:

```bash
eas whoami
eas project:info
```

## 2. Apple Developer 連携

EAS Build が App Store Connect API key を自動生成・登録する手順。

```bash
eas credentials
```

対話的に:

1. Platform: **iOS**
2. Profile: **production**（または preview）
3. **Set up a new key** を選択して App Store Connect API key を生成

Bundle Identifier `jp.buzzbase.mobile` の Capability に **In-App Purchase** を追加:

1. https://developer.apple.com/account/resources/identifiers/list で Bundle ID を選択
2. Capabilities タブで「In-App Purchase」にチェック
3. Save

> **重要**: `react-native-purchases` 10.x は Expo Config Plugin を **同梱していない**ため、
> Apple Developer Portal 側で IAP Capability を **手動で有効化する必要がある**（自動付与されない）。
> ネイティブモジュール自体は autolinking 経由で iOS / Android プロジェクトに組み込まれるので、
> `app.json` の `plugins` には登録しない。

## 3. RevenueCat ダッシュボード設定

### 3.1 iOS App 作成

1. https://app.revenuecat.com にログイン
2. Project > Apps > **+ New** > iOS
3. Bundle ID: `jp.buzzbase.mobile`
4. App Store Connect Shared Secret を貼り付け（App Store Connect > App > Sign-in Info > 共有秘密鍵）

### 3.2 API key 取得

1. Project Settings > API keys
2. **App-specific API keys** から iOS 用 public key（`appl_` で始まる）をコピー

### 3.3 Webhook 設定

1. Project Settings > Integrations > Webhooks
2. URL: `https://mysterious-hollows-68593-7476ce827bc4.herokuapp.com/api/v1/webhooks/revenuecat`
3. Authorization: `Bearer <REVENUECAT_WEBHOOK_SECRET>`（back の `REVENUECAT_WEBHOOK_SECRET` 環境変数と同じ値）
4. Send test webhook で 200 が返ることを確認

### 3.4 Product / Offering 設定

1. Products > **+ New** で月額 / 年額 product 作成（App Store Connect の Product ID と一致させる）
2. Offerings > Current Offering に両 product を含む package を作成

## 4. EAS Secret 登録

API key は Git に含めず EAS Secret 経由で配布する。

```bash
eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_REVENUECAT_API_KEY_IOS \
  --value appl_xxxxxxxxxxxxxxxxxxxx

# Android 用も用意（値は今は空でも OK、将来 Google Play 配信時に設定）
eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID \
  --value "goog_placeholder"
```

確認:

```bash
eas secret:list
```

`eas.json` の各プロファイル `env` で `$EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` のように `$` 接頭辞で Secret を参照済み。

## 5. iOS Build 実行

```bash
eas build --profile preview --platform ios
```

- 初回ビルドは ~15-25 分
- ビルド完了後、Expo ダッシュボードに `.ipa` ダウンロードリンクが出る

トラブル時:

- `Provisioning profile が無い` → `eas credentials` で再生成
- `In-App Purchase capability が無い` → Apple Developer ポータルで再確認

## 6. TestFlight 提出

```bash
eas submit --profile preview --platform ios
```

- App Store Connect の TestFlight タブにビルドが上がる
- 「ビルドを処理しています」表示で数十分 → 完了後に **TestFlight グループ**を作成して内部テスター追加

## 7. Sandbox テスター作成 + 動作確認

### 7.1 Sandbox Apple ID 作成

1. App Store Connect > ユーザーとアクセス > **Sandbox** > テスター
2. **+ 新規追加**
3. 新規メールアドレス（普段使わないもの）+ 強いパスワードで作成
4. 確認メールから verify

### 7.2 実機で Sandbox ログイン

1. 実機の **設定 > App Store > Sandbox アカウント** に Sandbox Apple ID でサインイン
2. （実機側のメイン Apple ID はそのままで OK）

### 7.3 購入テスト

1. TestFlight アプリから BUZZ BASE をインストール
2. アプリ内で Pro 加入フロー実行 → Sandbox 環境の購入ダイアログが出る
3. 「購入」をタップ → Sandbox 課金（実課金されない）
4. 確認:
   - RevenueCat ダッシュボード > Customers で `app_user_id = <user.id>` のレコードに `Active subscription` が表示される
   - BUZZ BASE back の `WebhookEvent` テーブルに RevenueCat event が記録される（`docker compose exec back bundle exec rails console` で確認）
   - `Subscription` テーブルの該当 user.id が `status: 'active'`, `plan_type: 'monthly' or 'yearly'` に更新される

## 8. トラブルシューティング

### Sandbox 購入が RevenueCat に届かない

- App Store Connect で Product 状態が **Ready to Submit** 以上か（Pending Developer Action はダメ）
- Bundle ID 完全一致
- Sandbox アカウントでログインしているか（メイン Apple ID では Sandbox 課金できない）
- RevenueCat ダッシュボード > Logs で App Store Server Notification が届いているか

### webhook 署名検証エラー

- back の `REVENUECAT_WEBHOOK_SECRET` と RevenueCat ダッシュボードの Authorization header の値が一致しているか
- back の `WebhookEvent` レコードで `error_message` を確認

### `Purchases not configured` エラー

- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` が EAS Secret に登録済みか（`eas secret:list`）
- Build 時に Secret が解決されたか（`eas build:view <build-id>` の Env 一覧で確認）

### app_user_id がずれる

- mobile 側で `Purchases.logIn(user.id.toString())` を呼んでいるか確認（`services/authService.ts` の signIn / validateToken と `services/googleAuthService.ts` / `services/appleAuthService.ts` の各成功パス）
- 未ログイン状態で購入された場合、RevenueCat 側は anonymous ID で記録される。ログイン後の `logIn` で transfer される挙動を期待
