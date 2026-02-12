import { gql } from "@apollo/client";

export const GET_ONBOARDING_PROFILE = gql`
  query GetOnboardingByLeadId($leadId: String!) {
    getOnboardingByLeadId(leadId: $leadId) {
      id
      leadId
      firstName
      lastName
      gender
      dob
      age
      occupation
      income
      company
      designation
      pan
      aadhaar
      mobile
      whatsapp
      email
      language
      location
      commAddress
      permAddress
      dpId
      clientCode
      brokerName
      schemeName
      accountOpeningDate
      tradeNumber
      nomineeName
      nomineeRelationship
      nomineeContact
      nomineeEmail
      nomineeAadhar
      nomineePan
      holderName
      bankName
      accNumber
      ifsc
      micr
      billName
      gst
      billingAddress
      agreementAccepted
    }
  }
`;

export const UPSERT_ONBOARDING_PROFILE = gql`
  mutation UpsertOnboarding($input: SaveOnboardingInput!) {
    upsertOnboarding(input: $input) {
      id
      agreementAccepted
    }
  }
`;

export const ACCEPT_ONBOARDING_AGREEMENT = gql`
  mutation AcceptOnboardingAgreement($input: AcceptAgreementInput!) {
    acceptOnboardingAgreement(input: $input)
  }
`;
