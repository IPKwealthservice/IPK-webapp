import type { LeadStageFilter } from "@/components/sales/myleads/interface/type";

/**
 * ClientStage: Pipeline progression stages
 * Represents where in the sales process the lead currently sits
 */
export enum ClientStage {
  NEW_LEAD = "NEW_LEAD",
  FIRST_TALK_DONE = "FIRST_TALK_DONE",
  FOLLOWING_UP = "FOLLOWING_UP",
  CLIENT_INTERESTED = "CLIENT_INTERESTED",
  ACCOUNT_OPENED = "ACCOUNT_OPENED",
  NO_RESPONSE_DORMANT = "NO_RESPONSE_DORMANT",
  NOT_INTERESTED_DORMANT = "NOT_INTERESTED_DORMANT",
  RISKY_CLIENT_DORMANT = "RISKY_CLIENT_DORMANT",
  HIBERNATED = "HIBERNATED",
}

/**
 * LeadInteractionType: Types of interactions that can be recorded
 */
export enum LeadInteractionType {
  CALL = "CALL",
  MEETING = "MEETING",
  WHATSAPP = "WHATSAPP",
  EMAIL = "EMAIL",
  NOTE = "NOTE",
  PHONE_ADDED = "PHONE_ADDED",
  PHONE_REMOVED = "PHONE_REMOVED",
  PHONE_MARKED_PRIMARY = "PHONE_MARKED_PRIMARY",
  INTERACTION = "INTERACTION",
  STATUS_CHANGE = "STATUS_CHANGE",
  STAGE_CHANGE = "STAGE_CHANGE",
  ASSIGNMENT = "ASSIGNMENT",
  REMARK_UPDATED = "REMARK_UPDATED",
}

/**
 * LeadInteraction: Single interaction event in the lead's activity timeline
 * Captures all actions taken on a lead
 */
export type LeadInteraction = {
  id: string;
  leadId: string;
  type: LeadInteractionType | string;
  occurredAt: string;
  authorId: string;
  authorName?: string | null;
  authorEmail?: string | null;
  text?: string | null;
  pipelineStageFrom?: ClientStage | null;
  pipelineStageTo?: ClientStage | null;
  statusFilterFrom?: LeadStageFilter | string | null;
  statusFilterTo?: LeadStageFilter | string | null;
  nextActionDueAt?: string | null;
  channel?: "PHONE" | "MEETING" | "WHATSAPP" | "EMAIL" | string | null;
  outcome?: string | null;
  tags?: string[] | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * LeadInteractionHistory: Complete interaction history for a lead
 * Contains all remarks and interactions with who performed them
 */
export type LeadInteractionHistory = {
  leadId: string;
  interactions: LeadInteraction[];
  remarkHistory: RemarkEntry[];
  totalInteractions: number;
};

/**
 * RemarkEntry: Individual remark with full audit trail
 * Tracks who saved what and when
 */
export type RemarkEntry = {
  id?: string;
  text: string;
  author: string;
  authorId?: string;
  createdAt: string;
  updatedAt?: string;
  // Indicates if this was saved as part of an interaction
  associatedInteractionId?: string;
};

/**
 * LeadInteractionInput: Payload for creating/updating interactions
 */
export type LeadInteractionInput = {
  leadId: string;
  type: LeadInteractionType | string;
  text?: string;
  pipelineStageFrom?: ClientStage | null;
  pipelineStageTo?: ClientStage | null;
  statusFilterFrom?: LeadStageFilter | string | null;
  statusFilterTo?: LeadStageFilter | string | null;
  nextActionDueAt?: string | null;
  channel?: string | null;
  outcome?: string | null;
  occurredAt?: string;
  tags?: string[] | null;
  meta?: Record<string, unknown>;
};

/**
 * LeadRemarkUpdate: Payload for updating remarks/notes
 */
export type LeadRemarkUpdate = {
  leadId: string;
  text: string;
  // Flag to also create an interaction event
  createInteractionEvent?: boolean;
};

/**
 * ActivityTimelineData: Formatted data for timeline display
 */
export type ActivityTimelineData = {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  relativeTime: string;
  author?: {
    id: string;
    name: string;
    email?: string;
  };
  icon: string;
  badgeClass: string;
  summary?: string;
  details?: {
    from?: string;
    to?: string;
    nextFollowUp?: string;
    text?: string;
  };
};

/**
 * LeadInteractionFilter: Query filters for interactions
 */
export type LeadInteractionFilter = {
  leadId: string;
  types?: LeadInteractionType[] | string[];
  authorIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
};
