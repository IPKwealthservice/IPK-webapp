import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ONBOARDING_PROFILE } from "../../../../graphql/onboardingAgreement.gql";
import HeaderSteps from "../components/HeaderSteps";
import SuitabilityGauge from "../components/SuitabilityGauge";

export default function Suitability() {
  const navigate = useNavigate();
  const leadId = localStorage.getItem("onboarding_lead_id") || "";

  const { data, loading } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
    fetchPolicy: "network-only",
  });

  if (loading) return <p className="text-center py-10">Loading suitability...</p>;

  const profile = data?.getOnboardingByLeadId;
  const score = profile?.riskScore || 0;

  return (
    <div className="mobile-padding tablet-padding desktop-padding pb-12">
      <div className="flex justify-center mb-10 pt-8">
        <HeaderSteps current={4} />
      </div>

      <div className="max-w-4xl mx-auto">
        <SuitabilityGauge score={score} />

        <div className="flex justify-end mt-12">
          <button
            onClick={() => navigate("/sales/onboarding/process/agreement")}
            className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
