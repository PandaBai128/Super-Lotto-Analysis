export interface MyTicket {
  id: string;
  name: string;
  front: number[];
  back: number[];
  targetIssue: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketDraft = Pick<MyTicket, "name" | "front" | "back" | "targetIssue">;
