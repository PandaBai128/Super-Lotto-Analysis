import { type PrizeLevel, PRIZE_LEVELS } from "../../domain/rules";

interface PrizeLevelFilterProps {
  selected: PrizeLevel[];
  onChange: (levels: PrizeLevel[]) => void;
  levels?: readonly PrizeLevel[];
}

export function PrizeLevelFilter({ selected, onChange, levels = PRIZE_LEVELS }: PrizeLevelFilterProps) {
  function toggle(level: PrizeLevel) {
    onChange(selected.includes(level) ? selected.filter((item) => item !== level) : [...selected, level]);
  }

  return (
    <div className="prize-filter" aria-label="奖级筛选">
      <span className="prize-filter__title">显示奖级</span>
      {levels.map((level) => (
        <label key={level} className={selected.includes(level) ? "active" : ""}>
          <input checked={selected.includes(level)} type="checkbox" onChange={() => toggle(level)} />
          {level}
        </label>
      ))}
    </div>
  );
}
