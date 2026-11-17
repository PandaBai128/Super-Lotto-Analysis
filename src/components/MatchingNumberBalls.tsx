import { NumberBall } from "./NumberBall";

export function MatchingNumberBalls({ nums, selected, tone = "front" }: {
  nums: number[];
  selected: number[];
  tone?: "front" | "back";
}) {
  return <span className="number-ball-group matching-number-balls">
    {nums.map((num) => <NumberBall key={num} num={num} tone={tone} matched={selected.includes(num)} />)}
  </span>;
}

export function DrawMatchLegend() {
  return <span className="draw-match-legend"><span><i className="is-hit" />深色命中</span><span><i />浅色未命中</span></span>;
}
