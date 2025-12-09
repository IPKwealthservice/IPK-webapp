import OnboardingHeader from "../OnboardingHeader";

export default function Authentication() {
  return (
    <div className="p-8">
      <OnboardingHeader />

      <h1 className="text-xl font-semibold mb-4">Authentication</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">Authentication steps will be added here.</p>
      </div>

      <div className="flex justify-between mt-6">
        <a href="/sales/onboarding/client-profile" className="px-6 py-2 bg-gray-400 text-white rounded-lg">
          Back
        </a>

        <a href="/sales/onboarding/risk-type" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Next
        </a>
      </div>
    </div>
  );
}
