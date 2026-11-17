import { useMemo, useState } from "react";
import { BarChart3, Bookmark, Database, Home, Search, Sparkles } from "lucide-react";
import { Disclaimer } from "./components/Disclaimer";
import { baseDraws, baseMeta } from "./data/staticData";
import { loadLocalDraws, mergeDraws } from "./data/localStore";
import { AnalysisPage } from "./features/analysis/AnalysisPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ManagePage } from "./features/manage/ManagePage";
import { PickerPage } from "./features/picker/PickerPage";
import { QueryPage } from "./features/query/QueryPage";
import { MyPage } from "./features/my/MyPage";
import { readMyTickets } from "./features/my/ticketStore";
import type { MyTicket } from "./features/my/ticketTypes";
import { usePrizeRuleMode } from "./hooks/usePrizeRuleMode";

const tabs = [
  { key: "home", label: "首页", icon: Home },
  { key: "my", label: "我的", icon: Bookmark },
  { key: "query", label: "查询", icon: Search },
  { key: "analysis", label: "分析", icon: BarChart3 },
  { key: "picker", label: "选号", icon: Sparkles },
  { key: "manage", label: "数据", icon: Database }
];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => readMyTickets().tickets.length ? "my" : "home");
  const [localDraws, setLocalDraws] = useState(() => loadLocalDraws());
  const [queryTicket, setQueryTicket] = useState<MyTicket | null>(null);
  const { mode: ruleMode, setMode: setRuleMode } = usePrizeRuleMode();
  const draws = useMemo(() => mergeDraws(baseDraws, localDraws), [localDraws]);

  function navigate(tab: string) {
    setQueryTicket(null);
    setActiveTab(tab);
  }

  function querySavedTicket(ticket: MyTicket) {
    setQueryTicket(ticket);
    setActiveTab("query");
    window.scrollTo(0, 0);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <strong>DLT Lab</strong>
          <span>大乐透玄学研究所</span>
        </div>
        <nav>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} className={activeTab === key ? "active" : ""} onClick={() => navigate(key)} type="button">
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <Disclaimer />
        {activeTab === "home" && <DashboardPage draws={draws} meta={baseMeta} onTab={navigate} />}
        {activeTab === "my" && <MyPage draws={draws} onQuery={querySavedTicket} ruleMode={ruleMode} onRuleMode={setRuleMode} />}
        {activeTab === "query" && <QueryPage key={queryTicket?.id ?? "empty"} draws={draws} initialSelection={queryTicket ?? undefined} ruleMode={ruleMode} onRuleMode={setRuleMode} />}
        {activeTab === "analysis" && <AnalysisPage draws={draws} />}
        {activeTab === "picker" && <PickerPage draws={draws} />}
        {activeTab === "manage" && <ManagePage draws={draws} localDraws={localDraws} onLocalDraws={setLocalDraws} />}
      </main>
    </div>
  );
}
