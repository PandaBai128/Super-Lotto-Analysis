import type { PrizeRuleMode } from "../domain/rules";

export function PrizeRuleSelector({ mode, onChange }: { mode: PrizeRuleMode; onChange: (mode: PrizeRuleMode) => void }) {
  return <div className="prize-rule-selector">
    <span>判奖口径</span>
    <div className="prize-rule-switch" role="group" aria-label="判奖口径">
      <button type="button" aria-pressed={mode === "latest"} onClick={() => onChange("latest")}>最新规则回看</button>
      <button type="button" aria-pressed={mode === "historical"} onClick={() => onChange("historical")}>当期历史规则</button>
    </div>
    <span className="prize-rule-caption">{mode === "latest" ? "统一按 2026 版七奖级" : "按开奖期号采用当时的六 / 九 / 七奖级"}</span>
  </div>;
}
