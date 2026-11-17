import { useEffect, useState } from "react";
import type { PrizeRuleMode } from "../domain/rules";

const STORAGE_KEY = "dlt-prize-rule-mode";

export function usePrizeRuleMode() {
  const [mode, setMode] = useState<PrizeRuleMode>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "historical" ? "historical" : "latest"; }
    catch { return "latest"; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); }
    catch { /* 存储不可用时，当前会话仍能切换规则。 */ }
  }, [mode]);
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) setMode(event.newValue === "historical" ? "historical" : "latest");
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return { mode, setMode };
}
