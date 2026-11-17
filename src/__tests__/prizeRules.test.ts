import { describe, expect, it } from "vitest";
import { evaluatePrize, evaluatePrizeHits, getPrizeLevelsForDraws, resolvePrizeRule } from "../domain/rules";
import { evaluateCompoundPrize, calcPrizeHits } from "../features/query/prizeStats";
import { ticketStats, summarizeTickets } from "../features/my/ticketStats";
import type { DltDraw } from "../types/dlt";
import type { MyTicket } from "../features/my/ticketTypes";

const labels = ["未中奖", "一等奖", "二等奖", "三等奖", "四等奖", "五等奖", "六等奖", "七等奖", "八等奖", "九等奖"];
const versions = [
  { issue: "19018", version: "2007", matrix: [[0, 0, 6], [0, 0, 6], [0, 6, 5], [6, 5, 4], [5, 4, 3], [3, 2, 1]] },
  { issue: "19019", version: "2019", matrix: [[0, 0, 9], [0, 0, 9], [0, 9, 8], [9, 8, 6], [7, 5, 4], [3, 2, 1]] },
  { issue: "26014", version: "2026", matrix: [[0, 0, 7], [0, 0, 7], [0, 7, 6], [7, 6, 5], [5, 4, 3], [3, 2, 1]] }
];
const front = [1, 2, 3, 4, 5];
const back = [1, 2];
const makeDraw = (issue: string, drawFront = [1, 2, 3, 4, 20], drawBack = back): DltDraw => ({
  issue, front: drawFront, back: drawBack, date: "2026-01-01", source: "test", importedAt: "2026-01-01T00:00:00.000Z"
});
const ticket: MyTicket = { id: "one", name: "边界测试", front, back, targetIssue: "", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };

describe.each(versions)("official $version prize conditions", ({ issue, version, matrix }) => {
  const cases = matrix.flatMap((row, f) => row.map((level, b) => ({ f, b, expected: labels[level] })));
  it.each(cases)("$f+$b => $expected", ({ f, b, expected }) => {
    const selectedFront = [...front.slice(0, f), ...[20, 21, 22, 23, 24].slice(0, 5 - f)];
    const selectedBack = [...back.slice(0, b), ...[10, 11].slice(0, 2 - b)];
    expect(evaluatePrize(selectedFront, selectedBack, front, back, { mode: "historical", issue })).toMatchObject({
      level: expected, frontHits: f, backHits: b, ruleVersion: version
    });
  });
});

describe("rule selection and integration", () => {
  it.each([
    ["07001", "2007", "三等奖"], ["19018", "2007", "三等奖"],
    ["19019", "2019", "四等奖"], ["26013", "2019", "四等奖"], ["26014", "2026", "三等奖"]
  ])("uses the correct side of boundary %s", (issue, version, level) => {
    expect(evaluatePrizeHits(4, 2, { mode: "historical", issue })).toMatchObject({ ruleVersion: version, level });
  });

  it("uses latest rules even on old draws unless historical is explicitly requested", () => {
    for (const issue of ["07001", "19018", "19019", "26013", "26014"]) {
      expect(evaluateCompoundPrize(front, back, makeDraw(issue))).toMatchObject({ level: "三等奖", ruleVersion: "2026" });
    }
    expect(() => resolvePrizeRule("historical")).toThrow();
    expect(() => resolvePrizeRule("historical", "2026-02-02")).toThrow();
    expect(() => evaluatePrizeHits(6, 2)).toThrow();
  });

  it("offers seven latest levels and only applicable historical levels", () => {
    expect(getPrizeLevelsForDraws([makeDraw("19019")])).toHaveLength(7);
    expect(getPrizeLevelsForDraws([makeDraw("19018")], "historical")).toHaveLength(6);
    expect(getPrizeLevelsForDraws([makeDraw("19019")], "historical")).toHaveLength(9);
    expect(getPrizeLevelsForDraws([makeDraw("26014")], "historical")).toHaveLength(7);
    expect(getPrizeLevelsForDraws([makeDraw("19018"), makeDraw("19019"), makeDraw("26014")], "historical")).toHaveLength(9);
  });

  it("reassigns query and My prizes together without changing whether the tickets won", () => {
    const draws = [makeDraw("19018"), makeDraw("19019"), makeDraw("26014")];
    const latest = ticketStats(ticket, draws, "all");
    const historical = ticketStats(ticket, draws, "all", "historical");
    expect(latest.wins).toHaveLength(3);
    expect(historical.wins).toHaveLength(3);
    expect(latest.summary.find((row) => row.level === "三等奖")?.count).toBe(3);
    expect(historical.summary.find((row) => row.level === "三等奖")?.count).toBe(2);
    expect(historical.summary.find((row) => row.level === "四等奖")?.count).toBe(1);
    expect(historical.wins).toEqual(calcPrizeHits(draws, front, back, "historical"));
    expect(summarizeTickets([latest]).summary).toHaveLength(7);
    expect(summarizeTickets([historical]).summary).toHaveLength(9);
    expect(summarizeTickets([historical]).hits).toBe(3);
    expect(ticketStats(ticket, draws, 1, "historical").recentSummary).toHaveLength(7);
  });

  it("applies the selected mode to purchased issues and compound tickets", () => {
    const draws = [makeDraw("26013", [1, 2, 3, 20, 21], [1, 9])];
    const compound = { ...ticket, front: [...front, 6, 7], back: [...back, 3], targetIssue: "26013" };
    expect(ticketStats(compound, draws).checkPrize).toMatchObject({ level: "六等奖", ruleVersion: "2026", frontHits: 3, backHits: 1 });
    expect(ticketStats(compound, draws, "all", "historical").checkPrize).toMatchObject({ level: "八等奖", ruleVersion: "2019", frontHits: 3, backHits: 1 });
    expect(ticketStats({ ...compound, targetIssue: "26014" }, draws).checkPrize).toBeNull();
  });
});
