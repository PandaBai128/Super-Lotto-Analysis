import { useEffect, useState } from "react";
import { MY_TICKETS_KEY, readMyTickets, writeMyTickets } from "./ticketStore";
import type { MyTicket } from "./ticketTypes";

export function useMyTickets() {
  const [initial] = useState(readMyTickets);
  const [tickets, setTickets] = useState(initial.tickets);
  const [error, setError] = useState(initial.error);

  useEffect(() => {
    if (initial.migrated) {
      try { writeMyTickets(initial.tickets); }
      catch { setError("旧号码已读取，但保存失败。请检查浏览器是否允许本地存储。"); }
    }
    function reload(event: StorageEvent) {
      if (event.key !== MY_TICKETS_KEY && event.key !== null) return;
      const next = readMyTickets();
      setTickets(next.tickets);
      setError(next.error);
    }
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, [initial]);

  function commit(next: MyTicket[]) {
    const current = readMyTickets();
    if (current.error) throw new Error(current.error);
    try { writeMyTickets(next); }
    catch { throw new Error("保存失败，请检查浏览器是否允许本地存储，或是否已满。"); }
    setTickets(next);
    setError("");
  }

  return { tickets, error, commit };
}
