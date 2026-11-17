import { MatchingNumberBalls } from "../../components/MatchingNumberBalls";
import type { DltDraw } from "../../types/dlt";

export function QueryDrawRow({ draw, front, back }: { draw: DltDraw; front: number[]; back: number[] }) {
  return <div className="query-draw-row" aria-label={`第 ${draw.issue} 期开奖`}>
    <div className="query-draw-meta"><strong>{draw.issue}</strong><small>{draw.date}</small></div>
    <div className="query-draw-balls">
      <MatchingNumberBalls nums={draw.front} selected={front} />
      <MatchingNumberBalls nums={draw.back} selected={back} tone="back" />
    </div>
  </div>;
}
