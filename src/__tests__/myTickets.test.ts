import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MY_TICKETS_KEY, createTicket, parseTicketBackup, readMyTickets, ticketBackup, writeMyTickets } from "../features/my/ticketStore";

const draft = { name: "守号", front: [17, 1, 6, 15, 14], back: [3, 2], targetIssue: "" };

describe("my ticket persistence", () => {
  let storage: Map<string, string>;
  beforeEach(() => {
    storage = new Map();
    const localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); }
    };
    vi.stubGlobal("localStorage", localStorage);
    vi.stubGlobal("window", { localStorage });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("persists multiple single and compound tickets and retains identity when edited", () => {
    const single = createTicket(draft);
    const compound = createTicket({ ...draft, name: "复式", front: [1, 6, 14, 15, 17, 25], back: [2, 3, 8] });
    writeMyTickets([single, compound]);
    expect(readMyTickets().tickets).toEqual([single, compound]);
    expect(single.front).toEqual([1, 6, 14, 15, 17]);
    const edited = createTicket({ ...draft, name: "新名字", targetIssue: "26123" }, single);
    expect(edited.id).toBe(single.id);
    expect(edited.createdAt).toBe(single.createdAt);
    expect(edited.targetIssue).toBe("26123");
  });

  it("migrates the former query selection once, and does not resurrect deleted tickets", () => {
    storage.set("dlt-query-saved-numbers", JSON.stringify({ ...draft, savedAt: "2026-08-10T00:00:00.000Z" }));
    const loaded = readMyTickets();
    expect(loaded.migrated).toBe(true);
    expect(loaded.tickets[0].name).toBe("查询页保存的号码");
    writeMyTickets(loaded.tickets);
    expect(readMyTickets().migrated).toBe(false);
    writeMyTickets([]);
    expect(readMyTickets().tickets).toEqual([]);
  });

  it("preserves corrupt stored data and reports an error", () => {
    storage.set(MY_TICKETS_KEY, "{broken");
    expect(readMyTickets().error).not.toBe("");
    expect(storage.get(MY_TICKETS_KEY)).toBe("{broken");
  });

  it("rejects invalid numbers, duplicate numbers and malformed purchase issues", () => {
    expect(() => createTicket({ ...draft, front: [1, 2, 3, 4, 36] })).toThrow();
    expect(() => createTicket({ ...draft, back: [1, 1] })).toThrow();
    expect(() => createTicket({ ...draft, front: [1, 2, 3, 4, 5, NaN] })).toThrow();
    expect(() => createTicket({ ...draft, targetIssue: "123" })).toThrow();
  });

  it("round-trips backup files and rejects unsupported versions or duplicate IDs", () => {
    const ticket = createTicket(draft);
    expect(parseTicketBackup(ticketBackup([ticket]))).toEqual([ticket]);
    expect(() => parseTicketBackup(JSON.stringify({ version: 2, tickets: [ticket] }))).toThrow();
    expect(() => parseTicketBackup(ticketBackup([ticket, ticket]))).toThrow();
  });
});
