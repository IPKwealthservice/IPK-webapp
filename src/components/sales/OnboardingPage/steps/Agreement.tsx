import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../steps/HeaderSteps";

export default function Agreement() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <HeaderSteps current={5} />

      <h2 className="text-xl font-semibold mb-4">Agreement</h2>

      <div className="p-6 bg-white rounded-xl shadow">
        Agreement Content Coming Here...
      </div>
    </div>
  );
}
