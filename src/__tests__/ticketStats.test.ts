import { describe, expect, it } from "vitest";
import { calcHotCold } from "../features/analysis/calculators/hotCold";
import { buildTicketContext, analyzeTicket } from "../features/my/ticketAnalysis";
import { summarizeTickets, ticketStats } from "../features/my/ticketStats";
import type { MyTicket } from "../features/my/ticketTypes";
import type { DltDraw } from "../types/dlt";

const ticket: MyTicket = {
  id: "test", name: "测试号码", front: [1, 2, 3, 4, 5], back: [1, 2], targetIssue: "",
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z"
};
const make = (issue: string, front = [20, 21, 22, 23, 24], back = [9, 10]): DltDraw => ({
  issue, front, back, date: "2026-01-01", source: "test", importedAt: ticket.createdAt
});
const draws = [make("00001", ticket.front, ticket.back), ...Array.from({ length: 10 }, (_, i) => make(String(i + 2).padStart(5, "0"))), make("00012", ticket.front, [1, 9])];

describe("my ticket automatic checks", () => {
  it("separates latest, recent ten and full-history matches regardless of input order", () => {
    const stats = ticketStats(ticket, [...draws].reverse());
    expect(stats.checkDraw?.issue).toBe("00012");
    expect(stats.checkPrize?.level).toBe("二等奖");
    expect(stats.wins).toHaveLength(2);
    expect(stats.recentWins).toHaveLength(1);
    expect(stats.bestPrize).toBe("一等奖");
    expect(stats.summary.find((row) => row.level === "一等奖")?.count).toBe(1);
  });

  it("applies custom and all-history windows to counts, prizes and every draw row", () => {
    const latestOnly = ticketStats(ticket, draws, 1);
    expect(latestOnly.recentCount).toBe(1);
    expect(latestOnly.recentBest).toBe("二等奖");
    expect(latestOnly.recentRows.map((row) => row.draw.issue)).toEqual(["00012"]);
    const custom = ticketStats(ticket, draws, 7);
    expect(custom.recentCount).toBe(7);
    expect(custom.recentRows).toHaveLength(7);
    expect(custom.recentRows.some((row) => row.prize.level === "未中奖")).toBe(true);
    expect(custom.recentWins).toHaveLength(1);
    const all = ticketStats(ticket, draws, "all");
    expect(all.recentCount).toBe(12);
    expect(all.recentBest).toBe("一等奖");
    expect(all.recentSummary.find((row) => row.level === "一等奖")?.count).toBe(1);
    expect(ticketStats(ticket, draws, 100).recentCount).toBe(12);
  });

  it("aggregates group-period hits and never leaks all-time prizes into the selected window", () => {
    const overview = summarizeTickets([ticketStats(ticket, draws, 5), ticketStats({ ...ticket, id: "second" }, draws, 5)]);
    expect(overview).toMatchObject({ total: 2, winningGroups: 2, hits: 2, best: "二等奖" });
    expect(overview.summary.find((row) => row.level === "二等奖")?.count).toBe(2);
    expect(overview.summary.find((row) => row.level === "一等奖")?.count).toBe(0);
    const empty = summarizeTickets([]);
    expect(empty).toMatchObject({ total: 0, winningGroups: 0, hits: 0, best: "暂无命中" });
  });

  it("checks the purchased issue instead of silently checking latest", () => {
    const stats = ticketStats({ ...ticket, targetIssue: "00001" }, draws);
    expect(stats.checkPrize?.level).toBe("一等奖");
    expect(stats.checkDraw?.issue).toBe("00001");
    const pending = ticketStats({ ...ticket, targetIssue: "00013" }, draws);
    expect(pending.checkPrize).toBeNull();
    expect(pending.pending).toBe("等待开奖数据");
    expect(ticketStats({ ...ticket, targetIssue: "00000" }, draws).pending).toBe("本地尚未收录该期");
  });

  it("counts a compound ticket once per draw at its highest prize", () => {
    const compound = { ...ticket, front: [1, 2, 3, 4, 5, 6, 7], back: [1, 2, 3] };
    const stats = ticketStats(compound, [make("00001", [2, 3, 4, 5, 6], [2, 3])]);
    expect(stats.checkPrize).toMatchObject({ level: "一等奖", frontHits: 5, backHits: 2 });
    expect(stats.wins).toHaveLength(1);
  });

  it("recomputes saved tickets when new draws are added and handles no data", () => {
    expect(ticketStats(ticket, draws.slice(0, -1)).checkPrize?.level).toBe("未中奖");
    expect(ticketStats(ticket, draws).checkPrize?.level).toBe("二等奖");
    const empty = ticketStats(ticket, []);
    expect(empty.checkPrize).toBeNull();
    expect(empty.pending).toBe("暂无开奖数据");
    expect(empty.wins).toEqual([]);
  });

  it("uses the same heat calculator as analysis and reports verifiable structure", () => {
    const context = buildTicketContext(draws);
    expect(context.heat).toEqual(calcHotCold(draws));
    const analysis = analyzeTicket(ticket, context);
    expect(analysis.shape.sum).toBe(15);
    expect(analysis.shape.span).toBe(4);
    expect(analysis.shapeText).toBe("奇3 / 偶2 · 大0 / 小5");
    expect(analysis.zonesText).toBe("低5 / 中0 / 高0");
    expect(analysis.frontHeat.hot + analysis.frontHeat.warm + analysis.frontHeat.cold).toBe(5);
    expect(analysis.backHeat.hot + analysis.backHeat.warm + analysis.backHeat.cold).toBe(2);
    expect(analyzeTicket(ticket, buildTicketContext([])).heatText).toContain("暂无开奖数据");
  });
});
