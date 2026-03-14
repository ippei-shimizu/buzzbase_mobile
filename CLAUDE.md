# BUZZ BASE モバイルアプリ

React Native (Expo) で構築するBUZZ BASEのモバイルアプリ。

## 技術スタック

- **フレームワーク**: Expo SDK 55 + React Native
- **ルーティング**: Expo Router（ファイルベース）
- **スタイリング**: NativeWind v4 + TailwindCSS v3
- **HTTP通信**: axios
- **認証トークン管理**: expo-secure-store

## パッケージ管理

- すべてのパッケージ管理操作には **yarn** を使用する
- `--ignore-engines` フラグが必要な場合がある（Node.jsバージョンの制約）

## 開発コマンド

- `yarn start` - Expo開発サーバー起動
- `yarn ios` - iOSシミュレータで起動
- `yarn android` - Androidエミュレータで起動
- `yarn typecheck` - TypeScript型チェック
- `yarn lint` - リンター実行
- `yarn format` - Prettierフォーマット

## ディレクトリ構造

```
app/              # Expo Router ファイルベースルーティング
├── (tabs)/       # タブナビゲーション
├── (auth)/       # 認証画面グループ
└── +not-found.tsx
components/       # 共通UIコンポーネント
└── ui/           # ベースUIコンポーネント
constants/        # 定数（API URL等）
hooks/            # カスタムフック
services/         # APIサービス（ドメインごと）
types/            # TypeScript型定義
utils/            # ユーティリティ（axiosInstance等）
```

## API接続

- **開発時（iOS Simulator）**: `http://localhost:3100/api/v1/`
- **開発時（Android Emulator）**: `http://10.0.2.2:3100/api/v1/`
- **本番**: 環境変数 `EXPO_PUBLIC_API_URL` で設定
- バックエンドはdevise_token_authを使用（access-token, client, uid ヘッダー）

## コード規約

- Web版（front/）と同じPrettier設定を使用
- TypeScript strict mode
- カラーテーマはWeb版と共通（tailwind.config.ts参照）

## パスエイリアス

- `@components/*` → `components/*`
- `@services/*` → `services/*`
- `@hooks/*` → `hooks/*`
- `@types/*` → `types/*`
- `@constants/*` → `constants/*`
- `@utils/*` → `utils/*`

## Gitルール

- コミットメッセージは **日本語** で記述
- フォーマット: `[Type]: [説明]`
- **mainブランチへの直push・直commitは禁止**
