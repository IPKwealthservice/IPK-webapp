/**
 * Follow-up Management Types
 * Handles next action scheduling and follow-up tracking
 * 
 * Logic:
 * - approachAt: Read-only field showing when lead was initially captured/approached
 * - nextActionDueAt: Updated when user saves a follow-up action
 */

/**
 * FollowUpSchedule: Represents scheduled follow-up action
 */
export type FollowUpSchedule = {
  id: string;
  leadId: string;
  nextActionDueAt: string; // ISO date when follow-up is due
  actionType?: "CALL" | "MEETING" | "WHATSAPP" | "EMAIL" | "NOTE" | string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | string;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

/**
 * LeadCaptureMetadata: Tracks when lead was first approached/captured
 */
export type LeadCaptureMetadata = {
  approachAt: string; // ISO date when lead was first captured (read-only)
  capturedBy?: string | null;
  capturedByName?: string | null;
  leadSource?: string | null;
};

/**
 * FollowUpInput: Payload for creating/updating follow-up action
 */
export type FollowUpInput = {
  leadId: string;
  nextActionDueAt: string; // Required: when follow-up is due
  actionType?: string;
  description?: string;
  priority?: string;
};

/**
 * FollowUpFormState: Form state for follow-up modal/component
 */
export type FollowUpFormState = {
  nextActionDueAt: string; // User input for next follow-up date
  actionType: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

/**
 * LeadTimingInfo: Consolidated timing information for lead
 */
export type LeadTimingInfo = {
  // Read-only: When lead was initially captured
  approachAt: string | null;
  
  // Editable: When next action is scheduled
  nextActionDueAt: string | null;
  
  // Additional tracking
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  lastContactedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
