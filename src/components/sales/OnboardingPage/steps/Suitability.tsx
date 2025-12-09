import OnboardingHeader from "../OnboardingHeader";

export default function Suitability() {
  return (
    <div className="p-8">
      <OnboardingHeader />

      <h1 className="text-xl font-semibold mb-4">Suitability</h1>

      <div className="bg-white p-6 rounded-xl shadow">Suitability questionnaire content here.</div>

      <div className="flex justify-between mt-6">
        <a href="/sales/onboarding/risk-type" className="px-6 py-2 bg-gray-400 text-white rounded-lg">
          Back
        </a>

        <a href="/sales/onboarding/agreement" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Next
        </a>
      </div>
    </div>
  );
}
