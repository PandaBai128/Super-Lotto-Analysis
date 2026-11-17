import { MatchingNumberBalls } from "./MatchingNumberBalls";
import type { DltDraw, PrizeResult } from "../types/dlt";

export function DrawMatchList({ selection, rows, latestIssue }: {
  selection: Pick<DltDraw, "front" | "back">;
  rows: Array<{ draw: DltDraw; prize: PrizeResult }>;
  latestIssue?: string;
}) {
  return <ol className="draw-match-list">
    {rows.map(({ draw, prize }) => {
      const winning = prize.level !== "未中奖";
      return <li className={`draw-match-row ${winning ? "is-win" : ""}`} key={draw.issue}>
        <div className="draw-match-issue"><strong>{draw.issue}{draw.issue === latestIssue && <i>最新</i>}</strong><small>{draw.date}</small><small className="draw-match-rule" title={`本行采用${prize.ruleLabel}`}>{prize.ruleLabel}</small></div>
        <div className="draw-match-balls" aria-label={`${draw.issue}期完整开奖号码，深色为命中`}>
          <div><span>前区</span><MatchingNumberBalls nums={draw.front} selected={selection.front} /></div>
          <div><span>后区</span><MatchingNumberBalls nums={draw.back} selected={selection.back} tone="back" /></div>
        </div>
        <div className="draw-match-prize"><strong>{prize.level}</strong><span>前 {prize.frontHits} / 后 {prize.backHits}</span></div>
      </li>;
    })}
  </ol>;
}
