import { useMutation } from "@apollo/client";
import { CALCULATE_RISK_MUTATION } from "../graphql/mutations/calculateRisk";

export const useCalculateRisk = () => {
  const [calculateRisk, { data, loading, error }] =
    useMutation(CALCULATE_RISK_MUTATION);

  return {
    calculateRisk,
    data,
    loading,
    error,
  };
};
