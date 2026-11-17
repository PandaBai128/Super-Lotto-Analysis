import { rules2007 } from "./rules2007";
import { rules2019 } from "./rules2019";
import { rules2026 } from "./rules2026";
import { ALL_PRIZE_LEVELS, type PrizeRuleMode } from "./types";

export const PRIZE_RULES = [rules2007, rules2019, rules2026] as const;
export const LATEST_PRIZE_RULE = rules2026;

export function resolvePrizeRule(mode: PrizeRuleMode = "latest", issue?: string) {
  if (mode === "latest") return LATEST_PRIZE_RULE;
  if (!issue || !/^\d{5}$/.test(issue)) throw new Error("按历史规则判奖必须提供有效的五位开奖期号。");
  if (issue >= rules2026.firstIssue) return rules2026;
  if (issue >= rules2019.firstIssue) return rules2019;
  return rules2007;
}

export function getPrizeLevelsForDraws(draws: Array<{ issue: string }>, mode: PrizeRuleMode = "latest") {
  if (mode === "latest" || !draws.length) return [...LATEST_PRIZE_RULE.levels];
  const levels = new Set(draws.flatMap((draw) => [...resolvePrizeRule(mode, draw.issue).levels]));
  return ALL_PRIZE_LEVELS.filter((level) => levels.has(level));
}
