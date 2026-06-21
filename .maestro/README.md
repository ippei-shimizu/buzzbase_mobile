# Maestro E2E（ゴールデンパス）

打席入力ウィザード・集計画面など、Jest 単体テストでは拾えない結合バグを E2E で守る。
ゴールデンパスは 3〜5 本に絞り、結合の主導線と後方互換だけを対象にする。

## フロー構成

| ファイル                            | 目的                                       | 守るリスク              |
| ----------------------------------- | ------------------------------------------ | ----------------------- |
| `flows/01_smoke_launch.yaml`        | アプリ起動 → ログイン画面表示              | 起動・土台の疎通        |
| `flows/02_existing_user_stats.yaml` | 既存ユーザーでログイン → 成績画面表示      | v2 リファクタの後方互換 |
| `flows/03_record_new_game.yaml`     | 記録ボタン → 試合情報フォーム              | 新仕様の主導線の結合    |
| `flows/_login.yaml`                 | ログイン共通サブフロー（runFlow で再利用） | -                       |

## ローカル実行

```bash
# 1. Maestro CLI（未導入なら）
curl -Ls "https://get.maestro.mobile.dev" | bash

# 2. シミュレータにアプリをビルド・インストール
yarn ios

# 3. テストユーザーの認証情報を環境変数で渡して実行
MAESTRO_EMAIL=<test-user@example.com> MAESTRO_PASSWORD=<password> \
  maestro test .maestro/

# 単一フローのみ
maestro test .maestro/flows/01_smoke_launch.yaml

# 対話的にセレクタを確認（flow 作成・修正時に便利）
maestro studio
```

## 前提

- **テストユーザー**: バックエンドに v1 データを seed 済みのテストアカウントが必要。
  `MAESTRO_EMAIL` / `MAESTRO_PASSWORD` で渡す（CI では Repository secrets）。
- **バックエンド**: アプリが向く API（`EXPO_PUBLIC_API_URL`）に上記ユーザーが存在すること。

## CI

`.github/workflows/maestro-e2e.yml`（macOS runner / iOS Simulator）。重いため
`workflow_dispatch` と `release/**` PR に限定。安定 green 後に通常 PR トリガを有効化する。

## セレクタ方針と今後の拡張

- 現状はテキストセレクタ中心（`tapOn: "ログイン"` 等）。アプリは testID がほぼ未付与。
- グラウンドタップや打席結果ボタンなど座標・動的要素を含む深い導線は、対象要素に
  **testID を付与**してから flow を伸ばすのが安定する。
- `03` は試合情報フォーム表示まで。打席ウィザード完走 → サマリー表示までの拡張は
  `maestro studio` で実セレクタを確認しながら段階的に追加する（flow 内 TODO 参照）。

## フォールバック

Expo SDK 55 で Maestro が動かない場合は、issue #380 の方針に従い Detox + Expo Custom Dev Client
への切り替えを検討する。
