import { stubLogger } from "./logger";

describe("stubLogger", () => {
  it("should conform interface", () => {
    stubLogger.silly("msg");
    // expect(true).toBe(false);
  });
});
