import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../components/HeaderSteps";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ACCEPT_ONBOARDING_AGREEMENT } from "@/graphql/onboardingAgreement.gql";


export default function Agreement() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={5} />
      </div>

        <h2 className="text-2xl font-semibold mb-6">Agreement</h2>

        <p className="text-gray-600 mb-6">
          Please read and confirm the onboarding agreement below.


        </p>

        <div className="border rounded-lg p-4 bg-gray-50 h-60 overflow-y-auto">
          <p className="text-sm text-gray-700 leading-6">
            Agreement content goes here...  
            Add terms, conditions, disclosures etc.
          </p>
        </div>

        <label className="flex items-center gap-3 mt-6 cursor-pointer">
          <input type="checkbox" className="w-5 h-5" />
          I agree to the above terms and conditions.
        </label>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate("/sales/onboarding/process/e-sign")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        </div>
      </div>
   // </div>
  );
}
