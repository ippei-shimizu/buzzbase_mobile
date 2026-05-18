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
    // 初回ロード中は <ActivityIndicator/> 側を出すため、RefreshControl 用の
    // isRefreshing は isLoading 中は false にして二重表示を防ぐ（issue #341）
    isRefreshing: isRefetching && !isLoading,
  };
};
```

- `data`を意味のある名前にrename（`profile`, `gameResults`等）
- `isRefetching`は`isRefreshing`にrename（RefreshControl向け）
- **初回ロード中の二重表示を避けるため `&& !isLoading` を付与する**。`if (isLoading) return <ActivityIndicator />` で全画面ローディングを出している間に、RefreshControl のスピナーが上から重ねて出ると不自然なちらつきになる
- 複数 query を OR で組み合わせる場合は `(a.isRefetching || b.isRefetching) && !(a.isLoading || b.isLoading)` の形にする
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

## Zustand

- ストアは最小限（認証: `useAuthStore`, 試合記録ウィザード: `useGameRecordStore`）
- ウィザードフロー完了/中断時に`reset()`を呼ぶ

## APIサービス (`services/`)

- すべて`axiosInstance`を使用（生axiosは使わない）
- Named Exportのみ（デフォルトエクスポートなし）
- 戻り値にジェネリクスで型指定: `axiosInstance.get<Type>(...)`
- `response.data`のみreturn
- v1: axiosInstanceのbaseURL利用 / v2: `API_BASE_URL`を直接付与
