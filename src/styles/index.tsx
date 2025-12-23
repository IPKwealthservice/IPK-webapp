import React from "react";
import HeaderSteps from "../components/sales/OnboardingPage/components/HeaderSteps";
import OnboardingProcess from "../components/sales/OnboardingPage/OnboardingProcess";
import "./media.css";

export default function OnboardingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <OnboardingProcess />
      </div>
    </div>
  );
}
