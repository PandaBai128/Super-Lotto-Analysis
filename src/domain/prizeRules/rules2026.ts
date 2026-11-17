import { ALL_PRIZE_LEVELS, type PrizeRule } from "./types";

export const rules2026: PrizeRule = {
  version: "2026", label: "2026版·7级", firstIssue: "26014",
  levels: ALL_PRIZE_LEVELS.slice(0, 7),
  source: "https://www.gstc.org.cn/newsDetail/010600/77722",
  table: [
    [5, 2, "一等奖"], [5, 1, "二等奖"],
    [5, 0, "三等奖"], [4, 2, "三等奖"], [4, 1, "四等奖"],
    [4, 0, "五等奖"], [3, 2, "五等奖"],
    [3, 1, "六等奖"], [2, 2, "六等奖"],
    [3, 0, "七等奖"], [2, 1, "七等奖"], [1, 2, "七等奖"], [0, 2, "七等奖"]
  ]
};
