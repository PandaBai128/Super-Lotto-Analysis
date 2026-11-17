import { evaluatePrizeHits, type PrizeLevel, type PrizeRuleMode, PRIZE_LEVELS } from "../../domain/rules";
import { countHits } from "../../domain/numbers";
import type { DltDraw, PrizeResult } from "../../types/dlt";

export interface PrizeHitRow {
  draw: DltDraw;
  prize: PrizeResult;
  complete: boolean;
}

export function calcPrizeHits(draws: DltDraw[], front: number[], back: number[], mode: PrizeRuleMode = "latest") {
  if (front.length < 5 || back.length < 2) return [];
  return draws.map((draw) => ({
    draw,
    prize: evaluateCompoundPrize(front, back, draw, mode),
    complete: draw.front.every((num) => front.includes(num)) && draw.back.every((num) => back.includes(num))
  })).filter((row) => row.prize.level !== "未中奖").reverse();
}

export function evaluateCompoundPrize(front: number[], back: number[], draw: DltDraw, mode: PrizeRuleMode = "latest"): PrizeResult {
  const frontHits = countHits(draw.front, front);
  const backHits = countHits(draw.back, back);
  return evaluatePrizeHits(frontHits, backHits, { mode, issue: draw.issue });
}

export function summarizePrizeHits(rows: PrizeHitRow[], levels: readonly PrizeLevel[] = PRIZE_LEVELS) {
  return levels.map((level) => ({
    level,
    count: rows.filter((row) => row.prize.level === level).length
  }));
}

export function filterPrizeHits(rows: PrizeHitRow[], levels: PrizeLevel[]) {
  const selected = new Set(levels);
  return rows.filter((row) => selected.has(row.prize.level as PrizeLevel));
}
