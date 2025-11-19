import { gql } from "@apollo/client";

/* ======================== FRAGMENTS ======================== */

/**
 * LeadInteraction fragment with complete audit trail
 */
export const FRAG_LEAD_INTERACTION = gql`
  fragment LeadInteractionParts on LeadInteractionEntity {
    id
    leadId
    type
    text
    occurredAt
    authorId
    authorName
    authorEmail
    
    pipelineStageFrom
    pipelineStageTo
    statusFilterFrom
    statusFilterTo
    
    nextActionDueAt
    channel
    outcome
    
    tags
    meta
    createdAt
    updatedAt
  }
`;

/**
 * Remark entry with audit info
 */
export const FRAG_REMARK_ENTRY = gql`
  fragment RemarkEntryParts on RemarkEntity {
    id
    text
    author
    authorId
    createdAt
    updatedAt
    associatedInteractionId
  }
`;

/**
 * Complete interaction history
 */
export const FRAG_INTERACTION_HISTORY = gql`
  fragment InteractionHistoryParts on LeadInteractionHistory {
    leadId
    totalInteractions
    interactions { ...LeadInteractionParts }
    remarkHistory { ...RemarkEntryParts }
  }
  ${FRAG_LEAD_INTERACTION}
  ${FRAG_REMARK_ENTRY}
`;

/* ======================== QUERIES ======================== */

/**
 * Fetch complete interaction history for a lead
 */
export const LEAD_INTERACTION_HISTORY = gql`
  query LeadInteractionHistory(
    $leadId: ID!
    $limit: Int = 50
    $offset: Int = 0
  ) {
    leadInteractionHistory(
      leadId: $leadId
      limit: $limit
      offset: $offset
    ) {
      ...InteractionHistoryParts
    }
  }
  ${FRAG_INTERACTION_HISTORY}
`;

/**
 * Fetch specific interactions by type
 */
export const LEAD_INTERACTIONS_BY_TYPE = gql`
  query LeadInteractionsByType(
    $leadId: ID!
    $types: [String!]!
    $limit: Int = 100
  ) {
    leadInteractionsByType(
      leadId: $leadId
      types: $types
      limit: $limit
    ) {
      ...LeadInteractionParts
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;

/**
 * Fetch remark history for a lead
 */
export const LEAD_REMARK_HISTORY = gql`
  query LeadRemarkHistory($leadId: ID!) {
    leadRemarkHistory(leadId: $leadId) {
      ...RemarkEntryParts
    }
  }
  ${FRAG_REMARK_ENTRY}
`;

/**
 * Get recent interactions for quick view
 */
export const LEAD_RECENT_INTERACTIONS = gql`
  query LeadRecentInteractions($leadId: ID!, $limit: Int = 10) {
    leadRecentInteractions(leadId: $leadId, limit: $limit) {
      ...LeadInteractionParts
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;

/* ======================== MUTATIONS ======================== */

/**
 * Create a new lead interaction (call, meeting, note, etc.)
 */
export const CREATE_LEAD_INTERACTION = gql`
  mutation CreateLeadInteraction($input: LeadInteractionInput!) {
    createLeadInteraction(input: $input) {
      ...LeadInteractionParts
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;

/**
 * Record a pipeline stage change with interaction event
 */
export const RECORD_STAGE_CHANGE = gql`
  mutation RecordStageChange(
    $leadId: ID!
    $from: String
    $to: String!
    $note: String
    $nextActionDueAt: String
  ) {
    recordStageChange(
      input: {
        leadId: $leadId
        pipelineStageFrom: $from
        pipelineStageTo: $to
        text: $note
        nextActionDueAt: $nextActionDueAt
      }
    ) {
      id
      leadId
      pipelineStageFrom
      pipelineStageTo
      text
      occurredAt
      authorId
      authorName
    }
  }
`;

/**
 * Record a lead status filter change with interaction event
 */
export const RECORD_STATUS_FILTER_CHANGE = gql`
  mutation RecordStatusFilterChange(
    $leadId: ID!
    $from: String
    $to: String!
    $note: String
    $nextActionDueAt: String
  ) {
    recordStatusFilterChange(
      input: {
        leadId: $leadId
        statusFilterFrom: $from
        statusFilterTo: $to
        text: $note
        nextActionDueAt: $nextActionDueAt
      }
    ) {
      id
      leadId
      statusFilterFrom
      statusFilterTo
      text
      occurredAt
      authorId
      authorName
    }
  }
`;

/**
 * Update remark and create interaction history entry
 */
export const UPDATE_LEAD_REMARK_WITH_INTERACTION = gql`
  mutation UpdateLeadRemarkWithInteraction(
    $leadId: ID!
    $text: String!
    $nextActionDueAt: String
    $createInteractionEvent: Boolean = true
  ) {
    updateLeadRemarkWithInteraction(
      input: {
        leadId: $leadId
        text: $text
        nextActionDueAt: $nextActionDueAt
        createInteractionEvent: $createInteractionEvent
      }
    ) {
      id
      text
      author
      authorId
      createdAt
      associatedInteractionId
    }
  }
`;

/**
 * Log an interaction (call, meeting, WhatsApp, etc.)
 */
export const LOG_INTERACTION = gql`
  mutation LogInteraction(
    $leadId: ID!
    $channel: String!
    $outcome: String
    $text: String
    $nextActionDueAt: String
  ) {
    logInteraction(
      input: {
        leadId: $leadId
        type: INTERACTION
        channel: $channel
        outcome: $outcome
        text: $text
        nextActionDueAt: $nextActionDueAt
      }
    ) {
      ...LeadInteractionParts
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;

/**
 * Add a note/remark to the timeline
 */
export const ADD_TIMELINE_NOTE = gql`
  mutation AddTimelineNote(
    $leadId: ID!
    $text: String!
    $nextActionDueAt: String
  ) {
    addTimelineNote(
      input: {
        leadId: $leadId
        type: NOTE
        text: $text
        nextActionDueAt: $nextActionDueAt
      }
    ) {
      ...LeadInteractionParts
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;

/**
 * Delete an interaction (soft delete/archive)
 */
export const DELETE_INTERACTION = gql`
  mutation DeleteInteraction($interactionId: ID!) {
    deleteInteraction(interactionId: $interactionId) {
      id
      deletedAt
    }
  }
`;

/**
 * Batch create interactions (for bulk operations)
 */
export const BATCH_CREATE_INTERACTIONS = gql`
  mutation BatchCreateInteractions(
    $inputs: [LeadInteractionInput!]!
  ) {
    batchCreateInteractions(inputs: $inputs) {
      success
      created
      failed
      interactions { ...LeadInteractionParts }
      errors {
        index
        message
      }
    }
  }
  ${FRAG_LEAD_INTERACTION}
`;
