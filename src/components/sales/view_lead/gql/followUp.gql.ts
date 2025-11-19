import { gql } from "@apollo/client";

/**
 * Follow-up GraphQL Queries and Mutations
 * Handles nextActionDueAt scheduling and follow-up management
 */

/* -------------------------------- Queries -------------------------------- */

/**
 * Get lead's follow-up schedule
 */
export const GET_LEAD_FOLLOW_UP = gql`
  query GetLeadFollowUp($leadId: ID!) {
    lead(id: $leadId) {
      id
      approachAt
      nextActionDueAt
      lastContactedAt
      createdAt
      updatedAt
    }
  }
`;

/* -------------------------------- Mutations ------------------------------- */

/**
 * Update follow-up schedule for a lead
 * Only updates nextActionDueAt field
 */
export const UPDATE_NEXT_ACTION_DUE = gql`
  mutation UpdateNextActionDue($input: UpdateNextActionDueInput!) {
    updateNextActionDue(input: $input) {
      id
      nextActionDueAt
      updatedAt
      leadCode
    }
  }
`;

/**
 * Create a follow-up action/event with scheduling
 * Records the follow-up action in timeline and updates nextActionDueAt
 */
export const CREATE_FOLLOW_UP_EVENT = gql`
  mutation CreateFollowUpEvent($input: CreateFollowUpEventInput!) {
    createFollowUpEvent(input: $input) {
      id
      leadId
      type
      text
      nextActionDueAt
      actionType
      priority
      occurredAt
      createdAt
    }
  }
`;

/**
 * Get follow-up history for a lead
 */
export const GET_FOLLOW_UP_HISTORY = gql`
  query GetFollowUpHistory($leadId: ID!, $limit: Int = 20, $offset: Int = 0) {
    followUpHistory(leadId: $leadId, limit: $limit, offset: $offset) {
      total
      followUps {
        id
        leadId
        nextActionDueAt
        actionType
        description
        priority
        createdBy
        createdAt
        completedAt
      }
    }
  }
`;
