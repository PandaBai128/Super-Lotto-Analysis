import { ALL_PRIZE_LEVELS, getPrizeLevelsForDraws, PRIZE_LEVELS, type PrizeRuleMode } from "../../domain/rules";
import type { DltDraw } from "../../types/dlt";
import { calcPrizeHits, evaluateCompoundPrize, summarizePrizeHits } from "../query/prizeStats";
import type { MyTicket } from "./ticketTypes";

export function ticketStats(ticket: MyTicket, draws: DltDraw[], count: number | "all" = 10, mode: PrizeRuleMode = "latest") {
  const sorted = [...draws].sort((a, b) => a.issue.localeCompare(b.issue));
  const latest = sorted.at(-1);
  const checkDraw = ticket.targetIssue ? sorted.find((draw) => draw.issue === ticket.targetIssue) : latest;
  const wins = calcPrizeHits(sorted, ticket.front, ticket.back, mode);
  const limit = count === "all" ? sorted.length : Number.isSafeInteger(count) && count > 0 ? count : 10;
  const recentDraws = sorted.slice(-limit);
  const recentIssues = new Set(recentDraws.map((draw) => draw.issue));
  const recentWins = wins.filter((row) => recentIssues.has(row.draw.issue));
  const levels = getPrizeLevelsForDraws(sorted, mode);
  const summary = summarizePrizeHits(wins, levels);
  const recentSummary = summarizePrizeHits(recentWins, getPrizeLevelsForDraws(recentDraws, mode));
  return {
    mode,
    levels,
    latest,
    checkDraw,
    checkPrize: checkDraw ? evaluateCompoundPrize(ticket.front, ticket.back, checkDraw, mode) : null,
    wins,
    recentWins,
    recentRows: [...recentDraws].reverse().map((draw) => ({
      draw,
      prize: evaluateCompoundPrize(ticket.front, ticket.back, draw, mode),
      complete: draw.front.every((num) => ticket.front.includes(num)) && draw.back.every((num) => ticket.back.includes(num))
    })),
    recentCount: recentDraws.length,
    recentSummary,
    recentBest: recentSummary.find((row) => row.count > 0)?.level ?? "暂无命中",
    summary,
    bestPrize: summary.find((row) => row.count > 0)?.level ?? "暂无命中",
    pending: !sorted.length ? "暂无开奖数据" : ticket.targetIssue > (latest?.issue ?? "") ? "等待开奖数据" : "本地尚未收录该期"
  };
}

export function summarizeTickets(stats: Array<ReturnType<typeof ticketStats>>) {
  const available = new Set(stats.length ? stats.flatMap((item) => item.recentSummary.map((row) => row.level)) : PRIZE_LEVELS);
  const summary = ALL_PRIZE_LEVELS.filter((level) => available.has(level)).map((level) => ({
    level,
    count: stats.reduce((sum, item) => sum + (item.recentSummary.find((row) => row.level === level)?.count ?? 0), 0)
  }));
  return {
    total: stats.length,
    winningGroups: stats.filter((item) => item.recentWins.length > 0).length,
    hits: stats.reduce((sum, item) => sum + item.recentWins.length, 0),
    best: summary.find((row) => row.count > 0)?.level ?? "暂无命中",
    summary
  };
}

export function bestPrizeOf(levels: string[]) {
  return ALL_PRIZE_LEVELS.find((level) => levels.includes(level)) ?? "暂无命中";
}
