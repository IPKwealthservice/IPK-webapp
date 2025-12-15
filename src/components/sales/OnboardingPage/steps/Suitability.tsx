import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../components/HeaderSteps";
import { useNavigate } from "react-router-dom";

export default function Suitability() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={4} />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-10">
        <h2 className="text-2xl font-semibold mb-6">Suitability Assessment</h2>

        <p className="text-gray-600 mb-6">
          Provide details to determine client's suitability.
        </p>

        <textarea
          placeholder="Write your assessment here..."
          className="w-full h-40 border rounded-lg p-4 outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate("/sales/onboarding/agreement")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
