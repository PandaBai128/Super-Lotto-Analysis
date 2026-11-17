import { useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { NumberBallGroup } from "../../components/NumberBall";
import { TicketReview } from "./TicketReview";
import { TicketHistory } from "./TicketHistory";
import { RecentTicketResults } from "./RecentTicketResults";
import type { TicketContext } from "./ticketAnalysis";
import type { ticketStats } from "./ticketStats";
import type { MyTicket } from "./ticketTypes";

export function MyTicketCard({ ticket, stats, context, onQuery, onEdit, onDelete }: {
  ticket: MyTicket;
  stats: ReturnType<typeof ticketStats>;
  context: TicketContext;
  onQuery: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isWin = stats.checkPrize && stats.checkPrize.level !== "未中奖";
  return (
    <article className="my-ticket" aria-label={ticket.name}>
      <header className="my-ticket-head">
        <div><h3>{ticket.name}</h3><span>{ticket.front.length > 5 || ticket.back.length > 2 ? "复式" : "单式"} · {ticket.front.length} + {ticket.back.length}<i />{ticket.targetIssue ? `购买第 ${ticket.targetIssue} 期` : "长期关注"}</span></div>
        <div className="my-ticket-actions">
          <button className="my-button my-ticket-query" type="button" onClick={onQuery} title="将这组号码带入查询" aria-label={`查询${ticket.name}`}><Search size={14} />去查询</button>
          <button className="my-icon-button" type="button" onClick={onEdit} title="编辑号码" aria-label={`编辑${ticket.name}`}><Pencil size={16} /></button>
          <button className="my-icon-button" type="button" onClick={() => setConfirmDelete(!confirmDelete)} title="删除号码" aria-label={`删除${ticket.name}`}><Trash2 size={16} /></button>
        </div>
      </header>
      {confirmDelete && <div className="my-delete-confirm" role="alert">
        <span>删除这组已保存号码？</span><button className="my-button" type="button" onClick={() => setConfirmDelete(false)}>取消</button><button className="my-button my-button--danger" type="button" onClick={onDelete}>确认删除</button>
      </div>}
      <div className="my-saved-numbers" aria-label="保存的号码">
        <div className="my-number-line"><span>前区</span><NumberBallGroup nums={ticket.front} /></div>
        <div className="my-number-line"><span>后区</span><NumberBallGroup nums={ticket.back} tone="back" /></div>
      </div>
      {ticket.targetIssue && <div className={`my-check-result my-purchase-result ${isWin ? "is-win" : ""}`}>
        <div><span>购买第 {ticket.targetIssue} 期</span><strong>{stats.checkPrize?.level ?? stats.pending}</strong></div>
        {stats.checkPrize && <span>前区命中 {stats.checkPrize.frontHits} 个 / 后区 {stats.checkPrize.backHits} 个 · {stats.checkPrize.ruleLabel}</span>}
      </div>}
      <div className="my-ticket-metrics">
        <div><span>所选区间命中</span><strong>{stats.recentWins.length}<small> 次</small></strong></div>
        <div><span>区间最高</span><strong>{stats.recentBest}</strong></div>
        <div><span>区间最近中奖</span><strong>{stats.recentWins[0]?.draw.issue ?? "暂无"}</strong></div>
      </div>
      {stats.recentWins.length > 0 && <div className="my-group-prizes" aria-label="本组区间奖级次数">
        {stats.recentSummary.filter((row) => row.count > 0).map((row) => <span key={row.level}>{row.level} <b>{row.count} 次</b></span>)}
      </div>}
      <RecentTicketResults key={stats.recentCount} ticket={ticket} stats={stats} />
      <TicketHistory ticket={ticket} stats={stats} />
      <TicketReview ticket={ticket} context={context} />
    </article>
  );
}
