import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../steps/HeaderSteps";

export default function Agreement() {
  return (
    <div className="max-w-5xl mx-auto p-8">

      <div className="flex justify-center mb-6">
        <HeaderSteps current={5} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Agreement</h2>

        {/* Agreement Upload / Preview */}
      </div>
    </div>
  );
}
