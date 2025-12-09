import React from "react";
import HeaderSteps from "../../../components/sales/OnboardingPage/HeaderSteps";
import OnboardingProcess from "../../../components/sales/OnboardingPage/OnboardingProcess";

export default function OnboardingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <HeaderSteps />
      <OnboardingProcess />
    </div>
  );
}
