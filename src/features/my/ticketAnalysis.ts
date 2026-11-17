import { formatNumber } from "../../domain/numbers";
import { omission } from "../../domain/stats";
import type { DltDraw } from "../../types/dlt";
import { calcHotCold } from "../analysis/calculators/hotCold";
import { PRIMES, structureOf, zoneCounts } from "../picker/pickerProfile";
import type { MyTicket } from "./ticketTypes";

export function buildTicketContext(draws: DltDraw[]) {
  return {
    count: draws.length,
    heat: calcHotCold(draws),
    frontOmission: omission(draws, "front"),
    backOmission: omission(draws, "back")
  };
}

export type TicketContext = ReturnType<typeof buildTicketContext>;

export function analyzeTicket(ticket: MyTicket, context: TicketContext) {
  const { front, back } = ticket;
  const zones = zoneCounts(front);
  const odd = front.filter((num) => num % 2 === 1).length;
  const big = front.filter((num) => num >= 18).length;
  const shape = structureOf(front);
  const frontHeat = heatMix(front, context.heat.frontHot, context.heat.frontCold);
  const backHeat = heatMix(back, context.heat.backHot, context.heat.backCold);
  const longest = (nums: number[], area: "front" | "back") => {
    const rows = area === "front" ? context.frontOmission : context.backOmission;
    return rows.filter((row) => nums.includes(row.num)).sort((a, b) => b.current - a.current || a.num - b.num)[0];
  };
  const frontGap = longest(front, "front");
  const backGap = longest(back, "back");
  const coverage = zones.filter(Boolean).length;
  const balance = Math.abs(odd - (front.length - odd)) <= 1;
  const character = `${coverage === 3 ? "三区均有覆盖" : coverage === 2 ? "集中在两个号段" : "集中在一个号段"}，${balance ? "奇偶相对均衡" : odd > front.length / 2 ? "奇数偏多" : "偶数偏多"}`;
  const heatText = !context.count ? "暂无开奖数据，暂不评价冷热"
    : frontHeat.hot > frontHeat.cold ? "前区偏热号" : frontHeat.cold > frontHeat.hot ? "前区偏冷号" : "前区冷热相配";
  return {
    title: character,
    heatText,
    frontHeat,
    backHeat,
    shape,
    shapeText: `奇${odd} / 偶${front.length - odd} · 大${big} / 小${front.length - big}`,
    zonesText: `低${zones[0]} / 中${zones[1]} / 高${zones[2]}`,
    textureText: `质数 ${front.filter((num) => PRIMES.has(num)).length} 个 · ${new Set(front.map((num) => num % 10)).size} 种尾数`,
    omissionText: context.count && frontGap && backGap
      ? `前区 ${gapLabel(frontGap)}；后区 ${gapLabel(backGap)}。`
      : "暂无遗漏数据。"
  };
}

function gapLabel(row: { num: number; current: number }) {
  return `${formatNumber(row.num)} ${row.current ? `已 ${row.current} 期未出` : "最近一期已出"}`;
}

function heatMix(nums: number[], hot: Array<{ num: number }>, cold: Array<{ num: number }>) {
  const hotCount = nums.filter((num) => hot.some((item) => item.num === num)).length;
  const coldCount = nums.filter((num) => cold.some((item) => item.num === num)).length;
  return { hot: hotCount, warm: nums.length - hotCount - coldCount, cold: coldCount };
}
