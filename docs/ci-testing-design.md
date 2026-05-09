# モバイルCI / テスト環境 設計書

## 背景

GitHub issue: [#154 Chore: モバイルアプリのCIとテストの実装](https://github.com/ippei-shimizu/buzzbase/issues/154)

`buzzbase_mobile`（Expo / React Native）にCIパイプラインを構築する。front / back には既にCIが構築済みなので、構成を揃えつつモバイル固有の事情（ビルドはEASに任せる前提）を反映する。

カバレッジの可視化サービス（Codecov等）は採用しない。理由：

- 個人開発スコープでPRレビューコメントの恩恵が薄い
- 外部サービス依存のメンテナンスコストを避けたい
- カバレッジ自体は CI ログ上で確認可能

なお、本issueと並行して `buzzbase_front` 側でも Codecov ステップを削除する（`chore/remove-codecov` ブランチで対応）。`buzzbase_back` には元から Codecov 連携がないため変更不要。

## ゴール / 非ゴール

### ゴール

- `main` ブランチへのpush・PR時に、lint / typecheck / format:check / test を自動実行する
- `yarn test:ci` でカバレッジを集計し、CI ログ上で確認可能にする
- front / back と統一感のあるCI構成にする

### 非ゴール

- 外部サービス（Codecov 等）へのカバレッジアップロード — 採用しない
- ビルド検証ジョブ（`expo export` / `expo prebuild` / `eas build` 等）の追加 — 別issueで対応
- E2Eテスト（Detox / Maestro 等）の導入 — 別issueで対応
- カバレッジしきい値（`coverageThreshold`）の強制 — 既存テストが少ないため初期は未設定
- 既存テスト範囲の拡充 — CI構築の範囲外、別issueで対応

## 全体構成

```
mobile/
├── .github/
│   └── workflows/
│       └── ci.yml          ← 既存（lint-and-typecheck のみ）→ test ステップ追加
├── .gitignore              ← coverage/ 除外を追加
├── .prettierignore         ← coverage 除外を追加
├── jest.config.js          ← collectCoverageFrom を追加
└── package.json            ← test:ci / test:coverage スクリプト追加
```

既存の `ci.yml` には `lint`, `typecheck`, `format:check` ステップが既にあり、`Lint & Typecheck` ジョブとして動作している。本issueで以下を変更する：

- ジョブ名を `lint-and-test` / `Lint & Test` に変更（front と統一）
- 末尾に `Run tests` ステップを追加（`yarn test:ci` 実行）

CI実行先: `ippei-shimizu/buzzbase_mobile` リポジトリ。設計書はこのリポジトリ（mobileサブモジュール）に保管する。

## ワークフロー仕様

### `mobile/.github/workflows/ci.yml`

```yaml
name: Mobile CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "yarn"

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: TypeScript type check
        run: yarn typecheck

      - name: ESLint check
        run: yarn lint

      - name: Prettier check
        run: yarn format:check

      - name: Run tests
        run: yarn test:ci
```

front / と異なる点:

| 項目         | front                | mobile      |
| ------------ | -------------------- | ----------- |
| name         | `Front CI`           | `Mobile CI` |
| 対象ブランチ | `main`, `stg`        | `main` のみ |
| build ジョブ | あり（`yarn build`） | なし        |

### Node.jsバージョン

- `20.x`（front / back と統一。ローカルNode v20.20.1で動作確認済み）

## `mobile/package.json` 追加スクリプト

```json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

front / と同じスクリプト名・オプション。`--coverage` を残すことで CI ログにカバレッジ数値を出力する（外部送信はしない）。

## `mobile/jest.config.js` 拡張

カバレッジ計測対象を明示的に絞る。Jest デフォルトでは「テストから import されたファイル」しか計測されないため、テストのないファイルがカバレッジ集計から除外されてしまい実態より高い数値が出る。`collectCoverageFrom` で全ソース対象を明示する。

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest-setup-files.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@types/(.*)$": "<rootDir>/types/$1",
    "^@constants/(.*)$": "<rootDir>/constants/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@stores/(.*)$": "<rootDir>/stores/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "stores/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "!**/__tests__/**",
    "!**/*.d.ts",
  ],
};
```

`coverageReporters` は Jest デフォルト（`["json", "lcov", "text", "clover"]`）のままで CI ログ表示に十分。

## 実装ステップ概要

詳細は実装時に進めるが、概要は以下：

1. `mobile/package.json` に `test:ci` / `test:coverage` を追加
2. `mobile/jest.config.js` に `collectCoverageFrom` を追加
3. `mobile/.gitignore` に `coverage/` を追加（カバレッジ生成物のコミット防止）
4. `mobile/.prettierignore` に `coverage` を追加（format:check の対象から除外）
5. ローカルで `yarn test:ci` / `yarn typecheck` / `yarn lint` / `yarn format:check` を実行し、すべてpassすることを確認
6. `mobile/.github/workflows/ci.yml` を更新（test ステップ追加・ジョブ名変更）
7. PRを作成し、CIが緑になることを確認

## リスク / 留意点

### 既存テストのCI環境（Ubuntu）互換性

ローカル開発はmacOSだが、CIは ubuntu-latest 上で動作する。`jest-expo` preset使用のため互換性は高いが、以下のケースで失敗する可能性がある：

- ファイルパスの大文字小文字（macOSは大小無視、Linuxは厳密）
- ネイティブモジュール依存の暗黙の存在
- Date / locale / timezone 依存のテスト

**対策**: ステップ3でローカル `yarn test:ci` 実行し、まずローカルmacOSでpassすることを確認。CI失敗時はログから原因を特定して個別対処。

### カバレッジ率の低さ

既存テストファイルは5件のみ。CI構築初期はカバレッジ率が低くても問題視しない。`coverageThreshold` は設定せず、改善は別issueで対応する。

### auto-lintフックとの相互作用

`/Users/shimizuippei/projects/dev/buzzbase/.claude/hooks/auto-lint.sh` がEdit/Write後に動作する。本issueの作業中に編集対象ファイル（`mobile/package.json` など）が自動整形される可能性があるが、整形内容が yarn lint / yarn format:check で通る範囲ならば許容する。

## 出典 / 参考

- front CI（変更後）: `front/.github/workflows/ci.yml`
- back CI: `back/.github/workflows/ci.yml`
- jest-expo preset: <https://docs.expo.dev/develop/unit-testing/>
