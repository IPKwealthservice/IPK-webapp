import { gql } from "@apollo/client";

export const CALCULATE_RISK_MUTATION = gql`
  mutation CalculateRisk($answers: [RiskAnswerInput!]!) {
    calculateRiskType(answers: $answers) {
      totalScore
      maxScore
      grade
      riskProfile
      speedometerValue
    }
  }
`;
