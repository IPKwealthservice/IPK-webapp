import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Client Profile", path: "/sales/onboarding/client-profile" },
  { id: 2, label: "Authentication", path: "/sales/onboarding/authentication" },
  { id: 3, label: "Risk Type", path: "/sales/onboarding/risk-type" },
  { id: 4, label: "Suitability", path: "/sales/onboarding/suitability" },
  { id: 5, label: "Agreement", path: "/sales/onboarding/agreement" },
  { id: 6, label: "E-Sign", path: "/sales/onboarding/e-sign" },
];

export default function HeaderSteps({ current }: { current: number }) {
  return (
    <div className="flex gap-4 mb-8">
      {steps.map((step) => (
        <Link
          key={step.id}
          to={step.path}
          className={`relative px-6 py-3 text-sm font-medium rounded-md
            ${current === step.id ? "bg-indigo-700 text-white" : "bg-indigo-200 text-indigo-900"}
          `}
        >
          {step.label}

          {/* Right Arrow shape */}
          <span
            className={`absolute top-0 right-[-20px] w-0 h-0 
                border-t-[20px] border-b-[20px]
                ${current === step.id ? "border-l-[20px] border-l-indigo-700" : "border-l-[20px] border-l-indigo-200"}
                border-t-transparent border-b-transparent`}
          ></span>
        </Link>
      ))}
    </div>
  );
}
