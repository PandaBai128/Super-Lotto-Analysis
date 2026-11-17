import type { PrizeResult } from "../types/dlt";
import { countHits } from "./numbers";
import { LATEST_PRIZE_RULE, resolvePrizeRule } from "./prizeRules/registry";
import type { PrizeRuleMode } from "./prizeRules/types";

export const PRIZE_LEVELS = LATEST_PRIZE_RULE.levels;
export { ALL_PRIZE_LEVELS } from "./prizeRules/types";
export type { PrizeLevel, PrizeRuleMode, PrizeRuleVersion } from "./prizeRules/types";
export { getPrizeLevelsForDraws, resolvePrizeRule } from "./prizeRules/registry";

export function evaluatePrize(
  selectedFront: number[],
  selectedBack: number[],
  drawFront: number[],
  drawBack: number[],
  options: { mode?: PrizeRuleMode; issue?: string } = {}
): PrizeResult {
  const frontHits = countHits(selectedFront, drawFront);
  const backHits = countHits(selectedBack, drawBack);
  return evaluatePrizeHits(frontHits, backHits, options);
}

export function evaluatePrizeHits(frontHits: number, backHits: number, options: { mode?: PrizeRuleMode; issue?: string } = {}): PrizeResult {
  if (!Number.isInteger(frontHits) || frontHits < 0 || frontHits > 5 || !Number.isInteger(backHits) || backHits < 0 || backHits > 2) {
    throw new Error("命中数必须为前区 0–5、后区 0–2。");
  }
  const rule = resolvePrizeRule(options.mode, options.issue);
  const match = rule.table.find(([front, back]) => front === frontHits && back === backHits);

  return {
    level: match?.[2] ?? "未中奖",
    frontHits,
    backHits,
    description: match ? `前区 ${frontHits} 个 + 后区 ${backHits} 个` : "未达到中奖条件",
    ruleVersion: rule.version,
    ruleLabel: rule.label
  };
}

export function isCompleteMatch(front: number[], back: number[], drawFront: number[], drawBack: number[]) {
  return countHits(front, drawFront) === 5 && countHits(back, drawBack) === 2;
}
