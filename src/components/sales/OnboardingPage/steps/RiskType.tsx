import OnboardingHeader from "../OnboardingHeader";

export default function RiskType() {
  return (
    <div className="p-8">
      <OnboardingHeader />

      <h1 className="text-xl font-semibold mb-4">Risk Type</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">Risk assessment content goes here.</p>
      </div>

      <div className="flex justify-between mt-6">
        <a href="/sales/onboarding/authentication" className="px-6 py-2 bg-gray-400 text-white rounded-lg">
          Back
        </a>

        <a href="/sales/onboarding/suitability" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Next
        </a>
      </div>
    </div>
  );
}
