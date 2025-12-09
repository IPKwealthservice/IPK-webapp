import OnboardingHeader from "../OnboardingHeader";

export default function Suitability() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <OnboardingHeader current={4} />

      <h2 className="text-xl font-semibold mb-4">Suitability Assessment</h2>

      <div className="p-6 bg-white rounded-xl shadow">
        Suitability Questions Coming Here...
      </div>
    </div>
  );
}
