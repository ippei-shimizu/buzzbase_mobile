import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react-native";

/**
 * テスト用の QueryClient を毎回新しく作る。
 * - retry: false でテスト中の再試行を無効化（MSW でエラーを返した直後にリトライされて
 *   ハンドラが消費されると予期せぬ挙動になるため）。
 * - gcTime/staleTime はデフォルト動作で問題ない（テストは短命）。
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const TestProviders = ({ children, queryClient }: ProvidersProps) => {
  const client = queryClient ?? createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

/**
 * QueryClientProvider を自動でラップして render する。
 *
 * @example
 *   const { getByText } = renderWithProviders(<SignInScreen />);
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
) => {
  const { queryClient, ...rest } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ),
    ...rest,
  });
};
