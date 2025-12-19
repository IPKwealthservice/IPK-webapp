import { gql } from "@apollo/client";

export const GET_NEW_ONBOARDING_LEADS = gql`
  query GetNewOnboardingLeads {
    onboardingNewLeads {
      id
      name
      mobile
      source
      status
    }
  }
`;

export const GET_COMPLETED_ONBOARDING_LEADS = gql`
  query GetCompletedOnboardingLeads {
    onboardingCompletedLeads {
      id
      name
      mobile
      source
      status
    }
  }
`;
