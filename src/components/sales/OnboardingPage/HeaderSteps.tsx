import React from "react";

const steps = [
  "Client Profile",
  "Authentication",
  "Risk Type",
  "Suitability",
  "Agreement",
  "E-Sign",
];

export default function HeaderSteps() {
  return (
    <div className="flex gap-4 mb-8 justify-center flex-wrap">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`px-6 py-2 text-sm font-medium rounded-lg text-white 
          ${index === 0 ? "bg-indigo-700" : "bg-indigo-400"}`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
