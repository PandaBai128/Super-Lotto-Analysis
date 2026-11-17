import { useEffect, useState } from "react";

const KEYS = ["5", "10", "20", "30", "50", "100", "200", "all", "custom"];
const STORAGE_KEY = "dlt-my-review-range";

export function useReviewRange() {
  const [settings, setSettings] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (KEYS.includes(value?.key) && validCount(value?.customCount)) return value as { key: string; customCount: number };
    } catch { /* 无可用偏好时采用默认区间。 */ }
    return { key: "10", customCount: 10 };
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
    catch { /* 区间仍可在当前页面使用。 */ }
  }, [settings]);

  const count = settings.key === "all" ? "all" : settings.key === "custom" ? settings.customCount : Number(settings.key);
  return {
    ...settings, count: count as number | "all",
    onKey: (key: string) => { if (KEYS.includes(key)) setSettings((value) => ({ ...value, key })); },
    onCustom: (customCount: number) => { if (validCount(customCount)) setSettings((value) => ({ ...value, customCount })); }
  };
}

export function MyReviewRange({ range, total, actual }: { range: ReturnType<typeof useReviewRange>; total: number; actual: number }) {
  const [draft, setDraft] = useState(String(range.customCount));
  const invalid = !validCount(Number(draft));
  return <div className="my-review-range">
    <label htmlFor="my-review-range">回看区间<select id="my-review-range" value={range.key} onChange={(event) => range.onKey(event.target.value)}>
      {KEYS.map((key) => <option value={key} key={key}>{key === "all" ? "全部历史" : key === "custom" ? "自定义期数" : `近 ${key} 期`}</option>)}
    </select></label>
    {range.key === "custom" && <label className="my-custom-range"><input aria-label="自定义回看期数" type="number" min={1} max={100000} step={1} value={draft} aria-invalid={invalid} onChange={(event) => {
      setDraft(event.target.value);
      range.onCustom(Number(event.target.value));
    }} />期</label>}
    <span className="my-range-caption">{actual ? `本次回看 ${actual} 期 / 已收录 ${total} 期` : "暂无开奖数据"}</span>
    {range.key === "custom" && invalid && <span className="my-range-error">请输入 1–100000 的整数</span>}
  </div>;
}

function validCount(value: number) {
  return Number.isSafeInteger(value) && value >= 1 && value <= 100000;
}
