import React from "react";
import HeaderSteps from "./components/HeaderSteps";
import OnboardingProcess from "./OnboardingProcess";

export default function OnboardingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <OnboardingProcess />
      </div>
    </div>
  );
}
