export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type TicketHistoryEntry = {
  event: string;
  responsibleAgent: string | { id: string, name: string } | null;
  status: TicketStatus;
  message: string;
  solution?: string | null;
  occurredAt: string;
};

export type AgentField = {
  id: string | null;
  name: string;
};

export type ClientField = {
  id: string | null;
  name: string;
};

export type CategoryField = {
  id: string;
  name: string;
};

export interface TicketDTO {
  _id: string;
  id?: string;
  title: string;
  category: string | CategoryField;
  priority: TicketPriority;
  description: string;
  clientId: string;
  client: ClientField | null;
  fileUrls: string[];
  status: TicketStatus;
  agentId: string | null;
  agent: AgentField | null;
  groupId: string | null;
  escalationLevel: number;
  history: TicketHistoryEntry[];
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
}
