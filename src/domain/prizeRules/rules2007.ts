import { ALL_PRIZE_LEVELS, type PrizeRule } from "./types";

export const rules2007: PrizeRule = {
  version: "2007", label: "2007版·6级", firstIssue: "07001",
  levels: ALL_PRIZE_LEVELS.slice(0, 6),
  source: "https://www.nmtc.com.cn/tzjq/17395.html",
  table: [
    [5, 2, "一等奖"], [5, 1, "二等奖"],
    [5, 0, "三等奖"], [4, 2, "三等奖"],
    [4, 1, "四等奖"], [3, 2, "四等奖"],
    [4, 0, "五等奖"], [3, 1, "五等奖"], [2, 2, "五等奖"],
    [3, 0, "六等奖"], [2, 1, "六等奖"], [1, 2, "六等奖"], [0, 2, "六等奖"]
  ]
};
