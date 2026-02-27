import { GET_ONBOARDING_PROFILE } from "@/graphql/onboardingAgreement.gql";
import { gql, useMutation, useQuery } from "@apollo/client";
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
  const leadId = localStorage.getItem("onboarding_lead_id") || "";

  const { data, loading } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
    fetchPolicy: "network-only",
  });

  const [upsertOnboarding] = useMutation(UPSERTONBOARDING_MUTATION);
  const [success, setSuccess] = useState(false);

  const profile = data?.getOnboardingByLeadId;

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Preparing E-Sign stage...</p>
      </div>
    );
  }

  return (
    <div className="mobile-padding tablet-padding desktop-padding pb-12 bg-gray-50 min-h-screen">
      <div className="flex justify-center mb-10 pt-8">
        <HeaderSteps current={6} />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-gray-900 to-indigo-900 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Final Authorization & E-Sign</h1>
              <p className="text-indigo-200 text-xs mt-1">Submit your profile for compliance review</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <img
                  src="/ipk-logo.jpg"
                  alt="IPK Wealth Logo"
                  className="h-12 w-auto object-contain bg-white px-3 py-1 rounded"
                />
              </div>
            </div>
          </div>

          <div className="p-10 sm:p-16">
            <div className="max-w-3xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Digital Confirmation</h2>
                <p className="text-gray-600 leading-relaxed">
                  You are about to complete the onboarding process for <strong>{[profile?.firstName, profile?.lastName].filter(Boolean).join(" ")}</strong>.
                  By clicking "Complete Onboarding", you confirm that all provided information is accurate and you agree to the terms of the Investment Advisory Agreement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Signature Preview */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Client Signature</h3>
                  <div className="border border-gray-200 rounded-xl p-6 h-40 flex items-center justify-center bg-gray-50 shadow-inner">
                    {profile?.signatureUrl ? (
                      <img
                        src={profile.signatureUrl}
                        alt="Digital Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-10 h-10 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <p className="text-xs">No signature found. <br /> Go back to Agreement step.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Seal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Authorized Signatory</h3>
                  <div className="border border-gray-200 rounded-xl p-6 h-40 flex flex-col items-center justify-center bg-gray-50 shadow-inner">
                    <img
                      src="/images/company-seal.png"
                      alt="Company Seal"
                      className="max-h-24 object-contain mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-xs text-gray-400 font-bold uppercase tracking-widest">Company Seal</span>';
                        }
                      }}
                    />
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center mt-auto">IPK Wealth Services Pvt Ltd</p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">Verification Complete</h4>
                  <p className="text-xs text-indigo-700 leading-relaxed mt-1">
                    Your profile data and electronic signature have been securely captured.
                    Upon completion, our compliance desk will review your application within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-8 sm:px-16 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button
              onClick={() => navigate("/sales/onboarding/process/agreement")}
              className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-semibold text-sm transition-all"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Review Agreement
            </button>

            <button
              onClick={handleComplete}
              disabled={!profile?.signatureUrl}
              className={`
                px-10 py-4 rounded-lg text-white font-bold text-sm uppercase tracking-widest shadow-xl
                transition-all duration-300 active:scale-95
                ${profile?.signatureUrl
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                  : "bg-gray-400 cursor-not-allowed"}
              `}
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
      <SuccessPopup open={success} />
    </div>
  );
}
