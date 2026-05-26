import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";
import { fetchFeatureFlags } from "../featureFlagsService";

describe("fetchFeatureFlags", () => {
  it("指定キーをクエリ配列で送り、back の返したフラット形式をそのまま返す", async () => {
    let receivedKeys: string[] = [];
    server.use(
      http.get(apiUrl("/feature_flags"), ({ request }) => {
        const url = new URL(request.url);
        receivedKeys = url.searchParams.getAll("keys[]");
        return HttpResponse.json({
          pro_features: true,
          cancellation_survey: false,
        });
      }),
    );

    const result = await fetchFeatureFlags([
      "pro_features",
      "cancellation_survey",
    ]);

    expect(receivedKeys).toEqual(["pro_features", "cancellation_survey"]);
    expect(result).toEqual({
      pro_features: true,
      cancellation_survey: false,
    });
  });

  it("back が未知 key を含めず返した場合もそのまま返す", async () => {
    server.use(http.get(apiUrl("/feature_flags"), () => HttpResponse.json({})));

    const result = await fetchFeatureFlags(["pro_features"]);

    expect(result).toEqual({});
  });
});
