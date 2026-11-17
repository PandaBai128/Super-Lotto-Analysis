import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type PrizeLevel } from "../../domain/rules";
import { PrizeLevelFilter } from "../query/PrizeLevelFilter";
import { filterPrizeHits } from "../query/prizeStats";
import type { ticketStats } from "./ticketStats";
import type { MyTicket } from "./ticketTypes";
import { DrawMatchList } from "../../components/DrawMatchList";

export function TicketHistory({ ticket, stats }: { ticket: MyTicket; stats: ReturnType<typeof ticketStats> }) {
  const [selectedLevels, setLevels] = useState<PrizeLevel[] | null>(null);
  const [page, setPage] = useState(0);
  const levels = selectedLevels ?? stats.levels;
  useEffect(() => { setLevels(null); setPage(0); }, [stats.mode]);
  const rows = filterPrizeHits(stats.wins, levels);
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  const currentPage = Math.min(page, pages - 1);

  return (
    <details className="my-history">
      <summary>全部历史中奖记录 <span>{stats.wins.length} 次{stats.wins.length > 0 && ` · 最高${stats.bestPrize}`}</span></summary>
      <dl className="my-prize-totals">
        {stats.summary.map((row) => <div key={row.level}><dt>{row.level}</dt><dd>{row.count}<small> 期</small></dd></div>)}
      </dl>
      <div className="my-history-controls">
        <span>全部历史 · 按奖级筛选后 {rows.length} 次</span>
      </div>
      <PrizeLevelFilter selected={levels} onChange={(value) => { setLevels(value); setPage(0); }} levels={stats.levels} />
      {rows.length ? <DrawMatchList selection={ticket} rows={rows.slice(currentPage * 20, (currentPage + 1) * 20)} latestIssue={stats.latest?.issue} /> : <p className="my-muted">所选奖级下暂无命中记录。</p>}
      {pages > 1 && <div className="my-pagination">
        <button className="my-icon-button" type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="上一页" title="上一页"><ChevronLeft size={16} /></button>
        <span>{currentPage + 1} / {pages}</span>
        <button className="my-icon-button" type="button" disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)} aria-label="下一页" title="下一页"><ChevronRight size={16} /></button>
      </div>}
      <p className="my-history-note">每期开奖只计最高奖级；{stats.mode === "latest" ? "统一按 2026 版七奖级回看" : "按每期当时规则回看"}，不代表实际购买或兑奖记录。</p>
    </details>
  );
}
