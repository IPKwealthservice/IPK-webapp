import { gql } from "@apollo/client";

export const UPDATE_LEAD_DETAILS = gql`
mutation UpdateLeadDetails($input: UpdateLeadDetailsInput!) {
  updateLeadDetails(input: $input) {
    name
    status
    stageFilter
    sipAmount
    referralName
    referralCode
    product
    occupations {
      companyName
      designation
      endedAt
      profession
      startedAt
    }
    location
    leadSource
    lastName
    firstName
    investmentRange
    gender
    email
    clientTypes
    clientStage
    age
    bioText
    nextActionDueAt
  }
}
`;

export const BIO_INTERACTION = gql`
mutation AddLeadInteraction($input: LeadInteractionInput!) {
  addLeadInteraction(input: $input) {
    type
  }
}
`