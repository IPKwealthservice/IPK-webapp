import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ONBOARDING_PROFILE } from "../../../../graphql/onboardingAgreement.gql";
import HeaderSteps from "../components/HeaderSteps";
import SuitabilityGauge from "../components/SuitabilityGauge";

export default function Suitability() {
  const navigate = useNavigate();
  const leadId = localStorage.getItem("onboarding_lead_id");

  const { data, loading } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const profile = data?.getOnboardingByLeadId;
  const score = profile?.riskScore || 0;
  const riskLabel = profile?.riskLabel || "N/A";

  return (
    <div className="mobile-padding tablet-padding desktop-padding">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={4} />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Suitability Assessment</h2>
        
        <SuitabilityGauge score={score} />
        
        <div className="mt-8 p-6 bg-indigo-50 rounded-2xl inline-block">
          <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider mb-1">Your Risk Profile</p>
          <p className="text-3xl font-black text-indigo-900">{riskLabel}</p>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/sales/onboarding/process/agreement")}
            className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
          >
            Authorize Agreement
          </button>
        </div>
      </div>
    </div>
  );
}
