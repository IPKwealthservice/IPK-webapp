import { gql } from "@apollo/client";

export const SEND_ONBOARDING_OTP = gql`
  mutation SendOnboardingOtp($input: SendOtpInput!) {
    sendOnboardingOtp(input: $input) {
      success
      message
    }
  }
`;

export const VERIFY_ONBOARDING_OTP = gql`
  mutation VerifyOnboardingOtp($input: VerifyOtpInput!) {
    verifyOnboardingOtp(input: $input) {
      success
      message
    }
  }
`;
