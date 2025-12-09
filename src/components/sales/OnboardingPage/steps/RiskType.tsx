import OnboardingHeader from "../OnboardingHeader";
import HeaderSteps from "../steps/HeaderSteps";

export default function RiskType() {
  return (
    <div className="max-w-5xl mx-auto p-8">
     <HeaderSteps current={3} />

      <h2 className="text-xl font-semibold mb-4">Risk Type Assessment</h2>

      <div className="p-6 bg-white rounded-xl shadow">
        Risk Type Questions Coming Here...
      </div>
    </div>
  );
}
