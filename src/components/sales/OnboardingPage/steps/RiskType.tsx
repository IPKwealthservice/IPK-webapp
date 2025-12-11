import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../steps/HeaderSteps";
import { useNavigate } from "react-router-dom";

export default function RiskType() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Step Header */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={3} />
      </div>

      {/* White Card */}
      <div className="bg-white shadow-lg rounded-xl p-10">

        <h2 className="text-2xl font-semibold mb-6">Risk Type</h2>

        <p className="text-gray-600 mb-6">
          Select the type of risk profile for the client.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="risk" className="w-5 h-5" />
            Conservative Investor
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="risk" className="w-5 h-5" />
            Moderate Investor
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="risk" className="w-5 h-5" />
            Aggressive Investor
          </label>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate("/sales/onboarding/suitability")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
