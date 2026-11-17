export const ALL_PRIZE_LEVELS = ["一等奖", "二等奖", "三等奖", "四等奖", "五等奖", "六等奖", "七等奖", "八等奖", "九等奖"] as const;

export type PrizeLevel = typeof ALL_PRIZE_LEVELS[number];
export type PrizeRuleMode = "latest" | "historical";
export type PrizeRuleVersion = "2007" | "2019" | "2026";

export interface PrizeRule {
  version: PrizeRuleVersion;
  label: string;
  firstIssue: string;
  levels: readonly PrizeLevel[];
  table: ReadonlyArray<readonly [number, number, PrizeLevel]>;
  source: string;
}
