import { describe, expect, it } from "vitest";
import { evaluatePrize } from "../domain/rules";

const drawFront = [1, 2, 3, 4, 5];
const drawBack = [1, 2];

describe("evaluatePrize", () => {
  it("returns first prize", () => {
    expect(evaluatePrize([1, 2, 3, 4, 5], [1, 2], drawFront, drawBack).level).toBe("一等奖");
  });

  it("returns second prize", () => {
    expect(evaluatePrize([1, 2, 3, 4, 5], [1, 9], drawFront, drawBack).level).toBe("二等奖");
  });

  it("defaults to the current seventh prize for two back hits", () => {
    expect(evaluatePrize([9, 10, 11, 12, 13], [1, 2], drawFront, drawBack)).toMatchObject({ level: "七等奖", ruleVersion: "2026" });
  });

  it("returns no prize when fixed conditions are not met", () => {
    expect(evaluatePrize([1, 8, 9, 10, 11], [1, 8], drawFront, drawBack).level).toBe("未中奖");
  });
});
