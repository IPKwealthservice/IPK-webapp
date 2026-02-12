import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSteps from "../components/HeaderSteps";
import SuccessPopup from "../components/SuccessPopup";

const UPSERTONBOARDING_MUTATION = gql`
  mutation UpsertOnboarding($input: SaveOnboardingInput!) {
    upsertOnboarding(input: $input) {
      id
      status
    }
  }
`;

export default function ESign() {
  const navigate = useNavigate();
  const leadId = localStorage.getItem("onboarding_lead_id");
  const [upsertOnboarding] = useMutation(UPSERTONBOARDING_MUTATION);
  const [success, setSuccess] = useState(false);

  const handleComplete = async () => {
    if (!leadId) {
      alert("Missing Lead ID");
      return;
    }

    try {
      await upsertOnboarding({
        variables: {
          input: {
            leadId,
            status: "COMPLETED"
          }
        }
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/sales/onboarding");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Failed to complete onboarding:", error);
      alert("Failed to complete onboarding");
    }
  };

  return (
    <div className="mobile-padding tablet-padding desktop-padding">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={6} />
      </div>

      <h2 className="text-2xl font-semibold mb-6">E-Sign</h2>

      <p className="text-gray-600 mb-4">
        Please digitally sign to complete your onboarding.
      </p>

      <div className="border rounded-lg p-6 flex justify-center items-center h-48 bg-gray-50">
        <p className="text-gray-500">E-Sign widget will appear here</p>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Complete Onboarding
        </button>
      </div>
      <SuccessPopup open={success} />
    </div>
  );
}
