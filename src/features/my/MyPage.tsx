import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Bookmark, Download, Plus, Upload } from "lucide-react";
import { DrawMatchLegend } from "../../components/MatchingNumberBalls";
import { SectionHeader } from "../../components/SectionHeader";
import { PrizeRuleSelector } from "../../components/PrizeRuleSelector";
import type { PrizeRuleMode } from "../../domain/rules";
import { drawKey, getRangeDraws } from "../../domain/numbers";
import type { DltDraw } from "../../types/dlt";
import { downloadText } from "../../utils/download";
import { MyTicketCard } from "./MyTicketCard";
import { TicketEditor } from "./TicketEditor";
import { buildTicketContext } from "./ticketAnalysis";
import { summarizeTickets, ticketStats } from "./ticketStats";
import { MyOverview } from "./MyOverview";
import { MyReviewRange, useReviewRange } from "./MyReviewRange";
import { parseTicketBackup, ticketBackup } from "./ticketStore";
import type { MyTicket } from "./ticketTypes";
import { useMyTickets } from "./useMyTickets";

export function MyPage({ draws, onQuery, ruleMode, onRuleMode }: {
  draws: DltDraw[];
  onQuery: (ticket: MyTicket) => void;
  ruleMode: PrizeRuleMode;
  onRuleMode: (mode: PrizeRuleMode) => void;
}) {
  const { tickets, error, commit } = useMyTickets();
  const [editor, setEditor] = useState<MyTicket | "new" | null>(null);
  const range = useReviewRange();
  const [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const context = useMemo(() => buildTicketContext(getRangeDraws(draws, range.count)), [draws, range.count]);
  const rows = useMemo(() => tickets.map((ticket) => ({ ticket, stats: ticketStats(ticket, draws, range.count, ruleMode) })), [tickets, draws, range.count, ruleMode]);
  const overview = useMemo(() => summarizeTickets(rows.map((row) => row.stats)), [rows]);

  function save(ticket: MyTicket) {
    if (tickets.some((item) => item.id !== ticket.id && selectionKey(item) === selectionKey(ticket))) {
      throw new Error("这组号码和购买期号已保存，可以直接编辑原记录。");
    }
    commit(tickets.some((item) => item.id === ticket.id) ? tickets.map((item) => item.id === ticket.id ? ticket : item) : [...tickets, ticket]);
    setMessage("号码已保存。");
  }

  function remove(id: string) {
    try { commit(tickets.filter((ticket) => ticket.id !== id)); setMessage("已删除这组号码。"); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "删除失败，请重试。"); }
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("备份文件过大，请选择小于 2 MB 的号码备份。");
      const imported = parseTicketBackup(await file.text());
      const keys = new Set(tickets.map(selectionKey));
      const ids = new Set(tickets.map((ticket) => ticket.id));
      const additions = imported.filter((ticket) => {
        if (keys.has(selectionKey(ticket))) return false;
        keys.add(selectionKey(ticket));
        return true;
      }).map((ticket) => {
        const id = ids.has(ticket.id) ? crypto.randomUUID() : ticket.id;
        ids.add(id);
        return { ...ticket, id };
      });
      if (additions.length) commit([...tickets, ...additions]);
      setMessage(`已恢复 ${additions.length} 组号码，跳过 ${imported.length - additions.length} 组重复号码。`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "备份恢复失败，请检查文件。"); }
  }

  return (
    <div className="page-stack my-page">
      <SectionHeader title="我的号码" desc="存下买过的、想守的号码，开奖之后回来看看。" actions={
        <div className="my-toolbar">
          <button className="my-icon-button" type="button" title="导出号码备份" aria-label="导出号码备份" disabled={!tickets.length} onClick={() => downloadText("my-dlt-tickets.json", ticketBackup(tickets))}><Download size={18} /></button>
          <button className="my-icon-button" type="button" title="恢复号码备份" aria-label="恢复号码备份" onClick={() => upload.current?.click()}><Upload size={18} /></button>
          <button className="my-button my-button--primary" type="button" onClick={() => setEditor("new")}><Plus size={17} />添加号码</button>
          <input className="my-file-input" ref={upload} type="file" accept=".json,application/json" aria-label="号码备份文件" onChange={restore} />
        </div>
      } />
      <div className="my-review-controls">
        <MyReviewRange range={range} total={draws.length} actual={context.count} />
        <PrizeRuleSelector mode={ruleMode} onChange={onRuleMode} />
      </div>
      <MyOverview overview={overview} count={context.count} historical={ruleMode === "historical"} />
      {(message || error) && <p className={error ? "my-error" : "my-message"} role="status">{error || message}</p>}
      {tickets.length > 0 && <div className="my-list-heading">
        <h3>我保存的号码 <span>{tickets.length}</span></h3>
        <DrawMatchLegend />
      </div>}
      {tickets.length ? <div className="my-ticket-grid">{rows.map(({ ticket, stats }) => <MyTicketCard key={ticket.id} ticket={ticket} stats={stats} context={context} onQuery={() => onQuery(ticket)} onEdit={() => setEditor(ticket)} onDelete={() => remove(ticket.id)} />)}</div> : <div className="my-empty">
        <Bookmark size={32} strokeWidth={1.4} /><h3>把你的第一组号码存下来</h3>
        <p>保存后自动检查最新一期，也能回看整段历史。</p>
        <button className="my-button my-button--primary" type="button" onClick={() => setEditor("new")}><Plus size={17} />添加第一组号码</button>
      </div>}
      <p className="my-storage-note">号码仅保存在此浏览器；可通过右上角导出备份。回看结果随已收录开奖更新。</p>
      {editor && <TicketEditor key={editor === "new" ? "new" : editor.id} ticket={editor === "new" ? undefined : editor} onSave={save} onClose={() => setEditor(null)} />}
    </div>
  );
}

function selectionKey(ticket: MyTicket) {
  return `${drawKey(ticket.front, ticket.back)}|${ticket.targetIssue}`;
}
