import { ALL_PRIZE_LEVELS, type PrizeRule } from "./types";

export const rules2019: PrizeRule = {
  version: "2019", label: "2019版·9级", firstIssue: "19019",
  levels: ALL_PRIZE_LEVELS,
  source: "https://www.nmtc.com.cn/tzjq/17395.html",
  table: [
    [5, 2, "一等奖"], [5, 1, "二等奖"], [5, 0, "三等奖"],
    [4, 2, "四等奖"], [4, 1, "五等奖"], [3, 2, "六等奖"], [4, 0, "七等奖"],
    [3, 1, "八等奖"], [2, 2, "八等奖"],
    [3, 0, "九等奖"], [2, 1, "九等奖"], [1, 2, "九等奖"], [0, 2, "九等奖"]
  ]
};
