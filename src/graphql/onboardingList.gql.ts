import { gql } from "@apollo/client";

export const GET_NEW_ONBOARDING_LEADS = gql`
  query GetNewOnboardingLeads {
    onboardingNewLeads {
      id
      firstName
      lastName
      mobile
      source
      status
      clientCode
    }
  }
`;

export const GET_COMPLETED_ONBOARDING_LEADS = gql`
  query GetCompletedOnboardingLeads {
    onboardingCompletedLeads {
      id
      firstName
      lastName
      mobile
      source
      status
      clientCode
    }
  }
`;
