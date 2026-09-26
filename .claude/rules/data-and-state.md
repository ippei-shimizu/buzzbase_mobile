# データ取得 / 状態管理ルール

## 状態管理の役割分担

| 種類             | ライブラリ     | 用途                           |
| ---------------- | -------------- | ------------------------------ |
| サーバー状態     | TanStack Query | API データのキャッシュ・再取得 |
| クライアント状態 | Zustand        | UI状態・フォームウィザード     |

## TanStack Query パターン

### Query系フック（`hooks/useXxx.ts`）

```tsx
export const useProfile = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUserProfile,
  });
  return {
    profile: data,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};
```

- `data`を意味のある名前にrename（`profile`, `gameResults`等）
- `isRefetching`は`isRefreshing`にrename（RefreshControl向け）。TanStack Query v5 では `isRefetching = isFetching && !isLoading` と内部定義されており、初回ロード中は自動的に false になる
- 条件付きクエリ: `enabled: !!userId`

### Mutation系フック（`hooks/useXxxMutations.ts`）

```tsx
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
  return { createGroup: mutation.mutateAsync, isCreating: mutation.isPending };
};
```

- `mutateAsync`を意味ある関数名で返す
- `isPending`を動詞形にrename（`isCreating`, `isDeleting`）
- `onSuccess`で関連queryを`invalidateQueries`

### 無限スクロール

- `useInfiniteQuery` + `getNextPageParam`でページネーション

### 非同期状態が確定するまで描画・計測しない

`useProStatus` などの状態フックは未確定（`isLoading: true`）の間 DEFAULT 値へフォールバックするため、値だけを見て分岐すると誤った表示が一瞬出る。同じクラスの指摘がレビューで2回出ている（front の CTA 文言、mobile の登録直後 Paywall）。

- **自動表示する画面・モーダルは、出すかどうかの判定が確定するまで本体を描画しない**。`ActivityIndicator`（色は `#d08000`）で待つ。ユーザーが自分で開いた画面ならロード中の描画は許容できるが、自動表示で「出た → 消えた」が起きると離脱に直結する
- **後から差し込まれるブロックでレイアウトを跳ねさせない**。購入プラン一覧のように別クエリで届く要素があるなら、それも確定に含めてから描画する
- **ファネルの計測条件は描画条件と同じ式にする**。「表示した」を送ったのに描画せず離脱した、という組み合わせを作ると分母が汚れる。判定に使う条件は 1 つの変数（例: `canShowPaywall`）に寄せ、描画・計測・遷移の 3 箇所で使い回す

## Zustand

- ストアは最小限（認証: `useAuthStore`, 試合記録ウィザード: `useGameRecordStore`）
- ウィザードフロー完了/中断時に`reset()`を呼ぶ

## APIサービス (`services/`)

- すべて`axiosInstance`を使用（生axiosは使わない）
- Named Exportのみ（デフォルトエクスポートなし）
- 戻り値にジェネリクスで型指定: `axiosInstance.get<Type>(...)`
- `response.data`のみreturn
- v1: axiosInstanceのbaseURL利用 / v2: `API_BASE_URL`を直接付与
