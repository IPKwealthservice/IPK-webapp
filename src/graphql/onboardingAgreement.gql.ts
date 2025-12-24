import { gql } from "@apollo/client";

export const ACCEPT_ONBOARDING_AGREEMENT = gql`
  mutation AcceptOnboardingAgreement($input: AcceptAgreementInput!) {
    acceptOnboardingAgreement(input: $input)
  }
`;
