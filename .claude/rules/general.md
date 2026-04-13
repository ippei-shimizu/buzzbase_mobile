# モバイル 全般ルール

## 技術スタック

- Expo SDK 55 + React Native
- ルーティング: Expo Router（ファイルベース）
- HTTP: axios（axiosInstance経由）
- サーバー状態: TanStack Query
- クライアント状態: Zustand
- 認証トークン: expo-secure-store
- アニメーション: react-native-reanimated

## パスエイリアス

- `@components/*`, `@services/*`, `@hooks/*`, `@types/*`, `@constants/*`, `@utils/*`, `@stores/*`

## 型定義 (`types/`)

- ドメインごとにファイル分割（`auth.ts`, `gameResult.ts`, `profile.ts`等）
- `interface`を基本とする（`type`はユニオン型のみ）
- **バックエンドのsnake_caseをそのまま使用**（camelCase変換しない）
- ページネーション: `{ current_page, per_page, total_count, total_pages }`の共通構造
- レスポンス型は`XxxResponse`サフィックス

## 認証

- `access-token` / `client` / `uid`の3トークン（DeviseTokenAuth形式）
- SecureStoreに保存、axiosInstanceのinterceptorで自動付与
- レスポンスヘッダーの新トークンで自動更新（トークンローリング）
- 401時はSecureStoreクリア（自動ログアウト）

## カラーテーマ（Web版と共通）

- primary: `#d08000` / main: `#2E2E2E` / sub: `#424242` / white: `#F4F4F4`

## 開発コマンド

- `yarn start` — Expo開発サーバー
- `yarn ios` / `yarn android` — シミュレータ起動
- `yarn typecheck` — 型チェック
- `yarn lint` — Lint実行
