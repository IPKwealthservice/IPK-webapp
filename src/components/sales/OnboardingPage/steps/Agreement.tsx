import OnboardingHeader from "../OnboardingHeader";

export default function Agreement() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <OnboardingHeader current={5} />

      <h2 className="text-xl font-semibold mb-4">Agreement</h2>

      <div className="p-6 bg-white rounded-xl shadow">
        Agreement Content Coming Here...
      </div>
    </div>
  );
}
