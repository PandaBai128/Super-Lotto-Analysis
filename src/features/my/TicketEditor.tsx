import { useEffect, useRef, useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import { formatNums } from "../../domain/numbers";
import { NumberPickPanel } from "../query/NumberPickPanel";
import { createTicket } from "./ticketStore";
import type { MyTicket } from "./ticketTypes";

export function TicketEditor({ ticket, onSave, onClose }: {
  ticket?: MyTicket;
  onSave: (ticket: MyTicket) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(ticket?.name ?? "");
  const [frontText, setFrontText] = useState(formatNums(ticket?.front ?? []));
  const [backText, setBackText] = useState(formatNums(ticket?.back ?? []));
  const [issue, setIssue] = useState(ticket?.targetIssue ?? "");
  const [error, setError] = useState("");
  const front = readNumbers(frontText);
  const back = readNumbers(backText);

  useEffect(() => { dialog.current?.showModal(); }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const next = createTicket({ name, front, back, targetIssue: issue.trim() }, ticket);
      onSave(next);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "号码保存失败，请重试。");
    }
  }

  return (
    <dialog ref={dialog} className="ticket-editor" aria-labelledby="ticket-editor-title" onCancel={onClose}>
      <form onSubmit={submit}>
        <header className="my-editor-head">
          <h3 id="ticket-editor-title">{ticket ? "编辑号码" : "添加我的号码"}</h3>
          <button className="my-icon-button" type="button" aria-label="关闭号码编辑" title="关闭" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="my-editor-body">
          <div className="my-editor-fields">
          <label htmlFor="ticket-name">名称<input id="ticket-name" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：一直守的号码、周六买的第二组" /></label>
          <label htmlFor="ticket-issue">购买期号 <small>选填，留空为长期关注</small><input id="ticket-issue" inputMode="numeric" maxLength={5} value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="例如 26123" /></label>
          <label htmlFor="ticket-front">前区<input id="ticket-front" value={frontText} onChange={(event) => setFrontText(event.target.value)} placeholder="至少 5 个，例如 01 06 14 15 17" /></label>
          <label htmlFor="ticket-back">后区<input id="ticket-back" value={backText} onChange={(event) => setBackText(event.target.value)} placeholder="至少 2 个，例如 02 03" /></label>
          </div>
          <NumberPickPanel front={front.filter(Number.isInteger)} back={back.filter(Number.isInteger)} onFront={setFrontText} onBack={setBackText} />
          {error && <p role="alert" className="my-error">{error}</p>}
        </div>
        <footer className="my-editor-footer">
          <span>{front.filter(Number.isInteger).length} + {back.filter(Number.isInteger).length} 个号码</span>
          <button className="my-button" type="button" onClick={onClose}>取消</button>
          <button className="my-button my-button--primary" type="submit"><Save size={16} />保存号码</button>
        </footer>
      </form>
    </dialog>
  );
}

function readNumbers(text: string) {
  return text.trim() ? text.trim().split(/[,\s，、|]+/).map(Number) : [];
}
