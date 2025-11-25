import { gql } from "@apollo/client";

const PHONE_FIELDS = gql`
  fragment LeadPhoneFields on LeadPhoneEntity {
    id
    label
    number
    normalized
    isPrimary
    isWhatsapp
  }
`;

export const ADD_LEAD_PHONE = gql`
  mutation AddLeadPhone($leadId: ID!, $input: LeadPhoneInput!) {
    addLeadPhone(leadId: $leadId, input: $input) {
      ...LeadPhoneFields
    }
  }
  ${PHONE_FIELDS}
`;

export const UPDATE_LEAD_PHONES = gql`
  mutation UpdateLeadPhones($input: UpdateLeadDetailsInput!) {
    updateLeadDetails(input: $input) {
      id
      phones {
        ...LeadPhoneFields
      }
    }
  }
  ${PHONE_FIELDS}
`;

export const REMOVE_LEAD_PHONE = gql`
  mutation RemoveLeadPhone($phoneId: ID!) {
    removeLeadPhone(phoneId: $phoneId) {
      ...LeadPhoneFields
    }
  }
  ${PHONE_FIELDS}
`;

export const MARK_PRIMARY_LEAD_PHONE = gql`
  mutation MarkPrimaryLeadPhone($phoneId: ID!) {
    markPrimaryLeadPhone(phoneId: $phoneId) {
      ...LeadPhoneFields
    }
  }
  ${PHONE_FIELDS}
`;

export const SET_LEAD_PHONE_WHATSAPP = gql`
  mutation SetLeadPhoneWhatsapp($phoneId: ID!, $isWhatsapp: Boolean!) {
    setLeadPhoneWhatsapp(phoneId: $phoneId, isWhatsapp: $isWhatsapp) {
      ...LeadPhoneFields
    }
  }
  ${PHONE_FIELDS}
`;

export const LEAD_PHONES = gql`
  query LeadPhones($leadId: ID!) {
    leadPhones(leadId: $leadId) {
      ...LeadPhoneFields
    }
  }
  ${PHONE_FIELDS}
`;
