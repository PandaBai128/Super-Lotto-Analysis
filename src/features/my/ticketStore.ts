import { normalizeNumberSelection, loadSavedNumberSet } from "../query/savedNumbers";
import type { MyTicket, TicketDraft } from "./ticketTypes";

export const MY_TICKETS_KEY = "dlt-my-tickets";

export function validateTicketDraft(draft: TicketDraft) {
  if (draft.name.trim().length > 40) throw new Error("名称最多 40 个字。");
  if (!normalizeNumberSelection(draft)) throw new Error("前区需选 5–35 个 01–35，后区需选 2–12 个 01–12。");
  if (new Set(draft.front).size !== draft.front.length || new Set(draft.back).size !== draft.back.length) {
    throw new Error("同一区域不能重复选择号码。");
  }
  if (draft.targetIssue && !/^\d{5}$/.test(draft.targetIssue)) throw new Error("购买期号需为 5 位数字，例如 26123。");
}

export function createTicket(draft: TicketDraft, existing?: MyTicket): MyTicket {
  validateTicketDraft(draft);
  const now = new Date().toISOString();
  return {
    ...draft,
    ...normalizeNumberSelection(draft)!,
    name: draft.name.trim() || "我的号码",
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export function parseTicketBackup(raw: string): MyTicket[] {
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1 || !Array.isArray(data.tickets)) {
    throw new Error("文件格式不正确，请选择“我的”页面导出的号码备份。");
  }
  const ids = new Set<string>();
  return data.tickets.map((value: unknown) => {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id || ids.has(value.id)
      || typeof value.name !== "string" || typeof value.targetIssue !== "string"
      || typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt))
      || typeof value.updatedAt !== "string" || !Number.isFinite(Date.parse(value.updatedAt))) {
      throw new Error("号码备份包含无效或重复的记录。");
    }
    const selection = normalizeNumberSelection(value);
    if (!selection) throw new Error("号码备份中存在不完整或越界的号码。");
    const draft = { ...selection, name: value.name, targetIssue: value.targetIssue };
    validateTicketDraft({ ...draft, front: value.front as number[], back: value.back as number[] });
    ids.add(value.id);
    return { ...draft, id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt };
  });
}

export function readMyTickets(): { tickets: MyTicket[]; error: string; migrated: boolean } {
  try {
    const raw = localStorage.getItem(MY_TICKETS_KEY);
    if (raw !== null) return { tickets: parseTicketBackup(raw), error: "", migrated: false };
    const legacy = loadSavedNumberSet();
    const now = new Date().toISOString();
    const createdAt = legacy?.savedAt && Number.isFinite(Date.parse(legacy.savedAt)) ? legacy.savedAt : now;
    const tickets = legacy ? [{
      front: legacy.front, back: legacy.back, name: "查询页保存的号码", id: "query-saved-ticket", targetIssue: "",
      createdAt, updatedAt: now
    }] : [];
    return { tickets, error: "", migrated: Boolean(legacy) };
  } catch {
    return { tickets: [], error: "号码读取失败，原记录已保留。请检查浏览器存储或刷新后重试。", migrated: false };
  }
}

export function ticketBackup(tickets: MyTicket[]) {
  return JSON.stringify({ version: 1, tickets }, null, 2);
}

export function writeMyTickets(tickets: MyTicket[]) {
  const raw = ticketBackup(tickets);
  parseTicketBackup(raw);
  localStorage.setItem(MY_TICKETS_KEY, raw);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
