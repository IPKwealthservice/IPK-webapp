import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Client Profile", path: "/sales/onboarding/client-profile" },
  { id: 2, label: "Authentication", path: "/sales/onboarding/authentication" },
  { id: 3, label: "Risk Type", path: "/sales/onboarding/risk-type" },
  { id: 4, label: "Suitability", path: "/sales/onboarding/suitability" },
  { id: 5, label: "Agreement", path: "/sales/onboarding/agreement" },
  { id: 6, label: "E-Sign", path: "/sales/onboarding/e-sign" },
];

export default function OnboardingHeader({ current = 1 }: { current: number }) {
  return (
    <div className="flex items-center gap-2 my-6">
      {steps.map((step) => (
        <Link
          key={step.id}
          to={step.path}
          className={`px-6 py-3 text-sm font-semibold rounded-r-lg 
            relative transition-all 
            ${
              current === step.id
                ? "bg-indigo-700 text-white"
                : "bg-indigo-100 text-indigo-700"
            }
          `}
          style={{
            clipPath:
              "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%)",
          }}
        >
          {step.label}
        </Link>
      ))}
    </div>
  );
}
