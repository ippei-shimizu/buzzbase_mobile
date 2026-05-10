/**
 * axiosInstance の振る舞いテスト。
 *
 * 方針: HTTP 層を MSW で intercept し、interceptors の振る舞い
 * （リクエストヘッダー付与・トークンローリング・401 時のクリア）を
 * services 関数を介さず直接検証する。
 */
import * as SecureStore from "expo-secure-store";
import {
  http,
  HttpResponse,
  apiUrl,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";

// jest-setup-msw の遅延 require と同じく、setupFiles 完了後に require する
// eslint-disable-next-line @typescript-eslint/no-require-imports
const axiosInstance = require("../axiosInstance").default;

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("リクエストインターセプタ: 認証ヘッダー付与", () => {
  it("SecureStore に 3 トークンが揃っていれば全てヘッダーに付与する", async () => {
    mockedSecureStore.getItemAsync.mockImplementation(async (key) => {
      if (key === "access-token") return "tk-access";
      if (key === "client") return "tk-client";
      if (key === "uid") return "tk-uid";
      return null;
    });

    let capturedHeaders: Headers | null = null;
    server.use(
      http.get(apiUrl("/ping"), ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );

    await axiosInstance.get("/ping");

    expect(capturedHeaders).not.toBeNull();
    expect(capturedHeaders!.get("access-token")).toBe("tk-access");
    expect(capturedHeaders!.get("client")).toBe("tk-client");
    expect(capturedHeaders!.get("uid")).toBe("tk-uid");
  });

  it("いずれかのトークンが欠けていれば認証ヘッダーを付与しない", async () => {
    mockedSecureStore.getItemAsync.mockImplementation(async (key) => {
      if (key === "access-token") return "tk-access";
      // client が欠けている
      return null;
    });

    let capturedHeaders: Headers | null = null;
    server.use(
      http.get(apiUrl("/ping"), ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );

    await axiosInstance.get("/ping");

    expect(capturedHeaders!.has("access-token")).toBe(false);
    expect(capturedHeaders!.has("client")).toBe(false);
    expect(capturedHeaders!.has("uid")).toBe(false);
  });
});

describe("レスポンスインターセプタ: トークンローリング", () => {
  it("レスポンスヘッダーに新しい access-token があれば SecureStore に保存する", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.setItemAsync.mockResolvedValue(undefined);

    server.use(
      http.get(apiUrl("/ping"), () =>
        HttpResponse.json(
          { ok: true },
          {
            headers: {
              "access-token": "new-access",
              client: "new-client",
              uid: "new-uid",
            },
          },
        ),
      ),
    );

    await axiosInstance.get("/ping");

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      "access-token",
      "new-access",
      expect.any(Object),
    );
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      "client",
      "new-client",
      expect.any(Object),
    );
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      "uid",
      "new-uid",
      expect.any(Object),
    );
  });

  it("access-token が無いレスポンスでは何も保存しない", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.setItemAsync.mockResolvedValue(undefined);

    server.use(
      http.get(apiUrl("/ping"), () => HttpResponse.json({ ok: true })),
    );

    await axiosInstance.get("/ping");

    expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});

describe("レスポンスインターセプタ: 401 時の挙動", () => {
  it("401 を受信したら全認証トークンを削除する", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);

    server.use(
      http.get(apiUrl("/ping"), () =>
        HttpResponse.json({ error: "unauthorized" }, { status: 401 }),
      ),
    );

    await expect(axiosInstance.get("/ping")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "access-token",
    );
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("client");
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("uid");
  });

  it("403 など 401 以外のエラーではトークンを削除しない", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);

    server.use(
      http.get(apiUrl("/ping"), () =>
        HttpResponse.json({ error: "forbidden" }, { status: 403 }),
      ),
    );

    await expect(axiosInstance.get("/ping")).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});
