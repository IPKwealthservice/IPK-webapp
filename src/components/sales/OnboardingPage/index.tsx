import React from "react";
import HeaderSteps from "./steps/HeaderSteps";
import OnboardingProcess from "./steps/OnboardingProcess";

export default function OnboardingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <HeaderSteps />
      <OnboardingProcess />
    </div>
  );
}
