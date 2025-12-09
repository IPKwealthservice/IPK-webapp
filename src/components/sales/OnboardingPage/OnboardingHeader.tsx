import React from "react";

interface HeaderProps {
  activeStep: number;
  onStepChange: (index: number) => void;
}

const steps = [
  "Client Profile",
  "Authentication",
  "Risk Type",
  "Suitability",
  "Agreement",
  "E-Sign",
];

export default function OnboardingHeader({ activeStep, onStepChange }: HeaderProps) {
  return (
    <div className="flex items-center justify-between w-full my-6">
      {steps.map((label, index) => {
        const isActive = activeStep === index;
        const isCompleted = activeStep > index;

        return (
          <div
            key={index}
            onClick={() => onStepChange(index)}
            className={`relative px-6 py-3 text-sm font-medium cursor-pointer select-none
              transition-all duration-200
              ${isActive ? "bg-indigo-700 text-white" : "bg-indigo-200 text-black"}
              ${isCompleted ? "bg-indigo-500 text-white" : ""}
              clip-path-arrow`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
