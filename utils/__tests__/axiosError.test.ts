import { AxiosError, AxiosHeaders } from "axios";
import {
  RATE_LIMIT_FALLBACK_MESSAGE,
  isRateLimitError,
  rateLimitErrorMessage,
} from "../axiosError";

const responseError = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

describe("isRateLimitError", () => {
  it("429 かつ安定コードが一致するとき true", () => {
    expect(
      isRateLimitError(
        responseError(429, {
          error: "rate_limit_exceeded",
          message: "上限です",
        }),
      ),
    ).toBe(true);
  });

  it("429 でも安定コードが違うとき false", () => {
    expect(isRateLimitError(responseError(429, { error: "other" }))).toBe(
      false,
    );
  });

  it("別のステータスのとき false", () => {
    expect(
      isRateLimitError(responseError(401, { error: "rate_limit_exceeded" })),
    ).toBe(false);
  });

  it("AxiosError でないとき false", () => {
    expect(isRateLimitError(new Error("network"))).toBe(false);
  });
});

describe("rateLimitErrorMessage", () => {
  it("バックエンドの message を優先する", () => {
    expect(
      rateLimitErrorMessage(
        responseError(429, {
          error: "rate_limit_exceeded",
          message: "しばらく待ってください",
        }),
      ),
    ).toBe("しばらく待ってください");
  });

  it("message が無ければフォールバック文言を返す", () => {
    expect(
      rateLimitErrorMessage(
        responseError(429, { error: "rate_limit_exceeded" }),
      ),
    ).toBe(RATE_LIMIT_FALLBACK_MESSAGE);
  });
});
