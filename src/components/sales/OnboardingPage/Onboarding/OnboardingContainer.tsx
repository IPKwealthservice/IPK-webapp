import { Outlet, useLocation } from "react-router-dom";
import HeaderSteps from "../components/HeaderSteps";

const stepIndexMap: Record<string, number> = {
  "client-profile": 1,
  "authentication": 2,
  "questionnaire": 3,
  "suitability": 4,
  "agreement": 5,
  "e-sign": 6,
};

export default function OnboardingContainer() {
  const location = useLocation();
  const currentStep =
    stepIndexMap[location.pathname.split("/").pop() || ""] || 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER STEPS */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={currentStep} />
      </div>

      {/* STEP CONTENT */}
      <Outlet />
    </div>
  );
}
