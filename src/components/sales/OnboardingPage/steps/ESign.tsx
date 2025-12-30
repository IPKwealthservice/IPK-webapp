import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../components/HeaderSteps";

export default function ESign() {
  return (
  <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
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
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Complete Onboarding
          </button>
        </div>

      </div>
    //</div>
  );
}
