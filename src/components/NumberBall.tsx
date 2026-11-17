interface NumberBallProps {
  num: number;
  tone?: "front" | "back" | "muted";
  matched?: boolean;
}

export function NumberBall({ num, tone = "front", matched }: NumberBallProps) {
  const text = String(num).padStart(2, "0");
  return <span className={`number-ball number-ball--${tone}${matched ? " number-ball--matched" : ""}`} title={matched === undefined ? undefined : `${text}：${matched ? "命中" : "未命中"}`}>{text}</span>;
}

export function NumberBallGroup({ nums, tone }: { nums: number[]; tone?: "front" | "back" | "muted" }) {
  return (
    <span className="number-ball-group">
      {nums.map((num) => <NumberBall key={num} num={num} tone={tone} />)}
    </span>
  );
}
