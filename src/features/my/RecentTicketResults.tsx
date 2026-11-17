import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DrawMatchList } from "../../components/DrawMatchList";
import type { ticketStats } from "./ticketStats";
import type { MyTicket } from "./ticketTypes";

export function RecentTicketResults({ ticket, stats }: { ticket: MyTicket; stats: ReturnType<typeof ticketStats> }) {
  const [onlyWins, setOnlyWins] = useState(true);
  const [visible, setVisible] = useState(3);
  const rows = onlyWins ? stats.recentWins : stats.recentRows;
  return <section className="my-recent-results" aria-label={`${ticket.name}的逐期命中`}>
    <div className="my-recent-heading">
      <strong>所选 {stats.recentCount} 期 · 开奖对照</strong>
      <label><input type="checkbox" checked={onlyWins} onChange={(event) => { setOnlyWins(event.target.checked); setVisible(3); }} />只看中奖</label>
    </div>
    {rows.length ? <DrawMatchList selection={ticket} rows={rows.slice(0, visible)} latestIssue={stats.latest?.issue} /> : <p className="my-muted">{onlyWins ? "所选区间内没有中奖记录，可取消勾选查看逐期开奖对照。" : "暂无开奖数据。"}</p>}
    {rows.length > 3 && <div className="my-period-more">
      <span>已显示 {Math.min(visible, rows.length)} / {rows.length} 期</span>
      {visible < rows.length && <button type="button" onClick={() => setVisible(visible + 10)}><ChevronDown size={14} />再看 {Math.min(10, rows.length - visible)} 期</button>}
      {visible > 3 && <button type="button" onClick={() => setVisible(3)}><ChevronUp size={14} />收起</button>}
    </div>}
  </section>;
}
