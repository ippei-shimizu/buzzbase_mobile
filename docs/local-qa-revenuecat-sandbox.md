# ローカル開発環境でのRevenueCat課金QAフロー（Apple Sandbox）

staging環境が無い前提で、ローカルのback（docker compose）に対してApple Sandbox経由の実課金フローをE2Eで検証する手順。EAS Build / TestFlightへの提出は不要で、ローカルビルドしたアプリを実機で動かして検証する。

`docs/eas-build-setup.md`で構築済みのRevenueCat/App Store Connect設定を前提とする（Product/Offering設定、In-App Purchase Capability等は完了済み）。本ドキュメントは「ローカルbackにWebhookを届けて検証する」部分に特化する。

## 前提

- Apple Developer Program加入済み、App Store ConnectでPro Monthly/Yearlyのサブスクリプション + お試しオファー設定済み
- RevenueCatでiOS App作成済み、Product/Offering設定済み
- `docker compose up`でback（`localhost:3100`）が起動していること
- Xcode + 実機（iPhone推奨。シミュレータでもiOS16+ならSandboxログイン可能だが、実機の方が安定する）
- ngrokアカウント（無料でOK）

## 1. ローカルbackの環境変数を確認

`back/.env.development`に以下が設定されていること（値は各自のRevenueCat/Stripeダッシュボードから取得）:

```
REVENUECAT_SECRET_API_KEY=sk_...
REVENUECAT_WEBHOOK_SECRET=<任意の強い文字列。RevenueCatダッシュボード側のAuthorizationヘッダー値と一致させる>
```

## 2. ngrokでlocalhost:3100を公開する

```bash
ngrok http 3100
```

`https://xxxx.ngrok-free.app`のようなURLが発行される。無料プランはセッションごとにURLが変わるため、QAのたびに以下3の設定を更新する必要がある。

## 3. RevenueCatのWebhook設定をQA用に切り替える

`docs/eas-build-setup.md`の3.3で本番Webhook（Heroku URL）が既に設定済みのため、**本番設定を上書きせず、別のWebhookエンドポイントとして追加する**（RevenueCatは複数エンドポイント登録に対応）。

1. RevenueCatダッシュボード → Project Settings → Integrations → Webhooks
2. 既存の本番URL（`https://mysterious-hollows-....herokuapp.com/api/v1/webhooks/revenuecat`）はそのまま残す
3. 新規追加: URL に `https://xxxx.ngrok-free.app/api/v1/webhooks/revenuecat`（2で発行されたngrok URL）
4. Authorization: `Bearer <REVENUECAT_WEBHOOK_SECRET>`（back の `.env.development` と同じ値）
5. Send test webhook で 200 が返ることを確認

QA終了後は、このQA用エンドポイントを削除するか無効化しておく（ngrok URLは再起動のたびに変わり無効になるため放置しても実害は小さいが、掃除しておくのが望ましい）。

## 4. mobileをローカルビルドして実機で実行する

Expo Goでは`react-native-purchases`のネイティブモジュールが動かないため、`expo run:ios`でネイティブビルドする。

```bash
cd mobile
yarn install
npx expo run:ios --device
```

- 接続した実機を選択してビルド・インストールする
- 実機は開発用Apple IDのプロビジョニングが必要（初回は Xcode で signing 設定を求められる場合あり）

### API接続先の設定

実機はローカルPCと同一ネットワーク上にあっても`localhost`はPC自身を指してしまうため、PCのLAN IPを明示する必要がある。

```bash
# PCのLAN IPを確認（例: 192.168.1.23）
ipconfig getifaddr en0
```

`mobile/.env`（または実行時の環境変数）で上書きする:

```
EXPO_PUBLIC_API_URL=http://192.168.1.23:3100
```

## 5. Sandboxテスターでログインして購入する

`docs/eas-build-setup.md`の7.1/7.2と同じ手順:

1. App Store Connect → ユーザーとアクセス → Sandbox → テスターを作成（未使用のメールアドレス）
2. 実機の 設定 → App Store → Sandboxアカウント にそのテスターでサインイン（メインのApple IDはそのまま）
3. 手順4でインストールしたBUZZ BASEアプリでPro加入フローを実行 → Sandboxの購入ダイアログが表示される
4. 「購入」をタップ（実課金されない）

## 6. 検証

- **ngrokのWebインターフェース**（`http://127.0.0.1:4040`）または起動ターミナルで、`/api/v1/webhooks/revenuecat`へのPOSTが届き200を返しているか確認
- **Railsコンソール**で反映を確認:
  ```bash
  docker compose exec back bundle exec rails console
  ```
  ```ruby
  user = User.find_by(id: <対象ユーザーID>)
  user.subscription
  # => status: "trial" or "active", plan_type, expires_at, platform: "ios" 等を確認
  WebhookEvent.where(provider: "revenuecat").order(created_at: :desc).first
  # => event_type, status: "processed" を確認
  ```
- **mobileアプリ側**で、Pro画面・設定画面にPro加入状態が反映されているか（`/pro/status`の再取得後）確認

## 7. 追加シナリオ（時間があれば）

Apple Sandboxはサブスクリプションの更新サイクルが大幅に短縮されている（月額プランが数分単位で更新される）ため、以下も同じセットアップのまま時間を置いて検証できる:

- **RENEWAL**: 数分待って自動更新されるか、`expires_at`が延長されるか
- **CANCELLATION → EXPIRATION**: 実機の設定 → App Store → Sandboxアカウント → サブスクリプション から解約し、次回更新タイミングでEXPIRATIONイベントが届きPro機能が失効するか（issue #450で修正したイベント順序逆転ガードの実地検証）
- **復元（Restore）**: アプリを再インストールし、「購入を復元」から同一Sandboxテスターの購入が復元されるか

## トラブルシューティング

`docs/eas-build-setup.md`の8章と共通の内容に加え、ローカル特有の点:

- **ngrok URLが古い**: 無料プランはngrok再起動のたびにURLが変わる。RevenueCat側のWebhook URLを都度更新すること
- **実機からlocalhostに繋がらない**: `EXPO_PUBLIC_API_URL`をPCのLAN IPに設定しているか確認。PCと実機が同一Wi-Fiネットワークにあるか確認
- **Webhookは届くがback側で処理されない**: `REVENUECAT_WEBHOOK_SECRET`がback（`.env.development`）とRevenueCatダッシュボードのAuthorizationヘッダーで一致しているか確認。`WebhookEvent`の`error_message`カラムも確認
