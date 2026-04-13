# コンポーネント設計ルール

## ディレクトリ構成

- `components/ui/` — 汎用ベースコンポーネント（Button, TextInput, Select等）
- `components/{feature}/` — 機能別コンポーネント（dashboard/, game-record/, groups/等）
- `components/ui/icons/` — SVGアイコンコンポーネント

## コンポーネントの書き方

- Named Export（`export function Xxx`）を使用 — デフォルトエクスポートはページ（`app/`配下）のみ
- RNコンポーネントを`Props extends XxxProps`で拡張するパターン
- `label` / `error` / `loading`など共通プロップを追加定義
- `style`プロップは`[defaultStyle, style]`の配列マージでオーバーライド可能

```tsx
interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}
export function Button({ title, loading, disabled, style, ...props }: Props) {
  // ...
}
```

## スタイリング

- 現状はインラインスタイル + `StyleSheet.create`が主体
- NativeWindのclassNameは既存コードではほぼ未使用
- カラーはTailwind設定のトークンと共通（`#d08000`=primary, `#2E2E2E`=main）
- ローディング時は`ActivityIndicator`を返す（色: `#d08000`）

## ルーティング（Expo Router）

- グループ`(auth)` `(tabs)` `(game-record)`はカッコ付きでURLに含まれない
- 動的ルートは`[id].tsx`または`[userId].tsx`
- 認証ガード: `(tabs)/_layout.tsx`で`useAuth`→未ログインなら`<Redirect>`
- タブ非表示: `href: null`で設定
