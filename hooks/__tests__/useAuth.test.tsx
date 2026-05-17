import { act, renderHook, waitFor } from "@testing-library/react-native";
import { validateToken } from "@services/authService";
import { useAuthStore } from "@stores/authStore";
import { getAuthToken } from "@utils/authTokenStorage";
import { TestProviders } from "../../__tests__/test-utils/renderWithProviders";
import { useAuth } from "../useAuth";

// useAuth が useQueryClient を参照するため Provider 必須。
const renderUseAuth = () =>
  renderHook(() => useAuth(), {
    wrapper: ({ children }) => <TestProviders>{children}</TestProviders>,
  });

// expo の URL/URLSearchParams 遅延polyfillと axios の browser エントリが
// jest 環境で衝突するため、テストでは axios の最小スタブだけ提供する。
// `axios.isAxiosError` は `isAxiosError === true` フラグ判定で十分。
jest.mock("axios", () => {
  const isAxiosError = (payload: unknown): boolean =>
    typeof payload === "object" &&
    payload !== null &&
    (payload as { isAxiosError?: boolean }).isAxiosError === true;
  return {
    __esModule: true,
    default: { isAxiosError },
    isAxiosError,
  };
});

jest.mock("@services/authService", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  resendConfirmation: jest.fn(),
  validateToken: jest.fn(),
}));

jest.mock("@services/appleAuthService", () => ({
  appleSignIn: jest.fn(),
}));

jest.mock("@services/googleAuthService", () => ({
  googleSignIn: jest.fn(),
}));

jest.mock("@utils/authTokenStorage", () => ({
  getAuthToken: jest.fn(),
}));

const mockedGetAuthToken = getAuthToken as jest.MockedFunction<
  typeof getAuthToken
>;
const mockedValidateToken = validateToken as jest.MockedFunction<
  typeof validateToken
>;

/** axios.isAxiosError(true) と判定される最小のエラーを生成する */
const buildAxiosError = (overrides: Record<string, unknown> = {}) =>
  Object.assign(new Error("axios error"), {
    isAxiosError: true,
    ...overrides,
  });

describe("useAuth checkAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({ isLoggedIn: undefined, isLoading: true });
    });
  });

  it("アクセストークンが無い場合は isLoggedIn=false になる", async () => {
    mockedGetAuthToken.mockResolvedValue(null);

    const { result } = renderUseAuth();

    await waitFor(() => expect(result.current.isLoggedIn).toBe(false));
    expect(mockedValidateToken).not.toHaveBeenCalled();
  });

  it("validateToken が成功すると isLoggedIn=true になる", async () => {
    mockedGetAuthToken.mockResolvedValue("valid-token");
    mockedValidateToken.mockResolvedValue({ data: { id: 1 } } as never);

    const { result } = renderUseAuth();

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));
    expect(mockedValidateToken).toHaveBeenCalledTimes(1);
  });

  it("ネットワークエラー（response無し）では isLoggedIn=true を維持する", async () => {
    mockedGetAuthToken.mockResolvedValue("valid-token");
    // axios の ERR_NETWORK 相当: AxiosError かつ response が無い
    mockedValidateToken.mockRejectedValue(buildAxiosError());

    const { result } = renderUseAuth();

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("401レスポンスの場合は isLoggedIn=false になる", async () => {
    mockedGetAuthToken.mockResolvedValue("invalid-token");
    mockedValidateToken.mockRejectedValue(
      buildAxiosError({ response: { status: 401, data: {} } }),
    );

    const { result } = renderUseAuth();

    await waitFor(() => expect(result.current.isLoggedIn).toBe(false));
  });
});
