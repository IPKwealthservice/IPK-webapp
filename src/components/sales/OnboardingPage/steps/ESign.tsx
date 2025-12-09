import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../steps/HeaderSteps";

export default function ESign() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <HeaderSteps current={6} />

      <h2 className="text-xl font-semibold mb-4">E-Sign</h2>

      <div className="p-6 bg-white rounded-xl shadow">
        E-Signature Form Coming Here...
      </div>
    </div>
  );
}
