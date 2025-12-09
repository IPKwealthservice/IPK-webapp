import OnboardingHeader from "../OnboardingHeader";

export default function ESign() {
  return (
    <div className="p-8">
      <OnboardingHeader />

      <h1 className="text-xl font-semibold mb-4">E-Sign</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        Digital signature workflow will be integrated here.
      </div>

      <div className="flex justify-between mt-6">
        <a href="/sales/onboarding/agreement" className="px-6 py-2 bg-gray-400 text-white rounded-lg">
          Back
        </a>

        <button className="px-6 py-2 bg-green-600 text-white rounded-lg">
          Complete Onboarding
        </button>
      </div>
    </div>
  );
}
