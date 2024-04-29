import { expect, test } from "vitest";
import { joinUrl } from "./joinUrl";

test("joinUrl", () => {
  expect(
    joinUrl(
      "https:///example.com",
      undefined,
      "en",
      ["/projects/", null, "//7"],
      null,
      "article//",
      42
    )
  ).toBe("https://example.com/en/projects/7/article/42");
});
