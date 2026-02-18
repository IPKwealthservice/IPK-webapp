import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Client Profile", path: "/sales/onboarding/process/client-profile" },
  { id: 2, label: "Authentication", path: "/sales/onboarding/process/authentication" },
  { id: 3, label: "Questionnaire", path: "/sales/onboarding/process/risk-type" },
  { id: 4, label: "Suitability", path: "/sales/onboarding/process/suitability" },
  { id: 5, label: "Agreement", path: "/sales/onboarding/process/agreement" },
  { id: 6, label: "E-Sign", path: "/sales/onboarding/process/e-sign" },
];

export default function HeaderSteps({ current }: { current: number }) {
  return (
    <div className="flex justify-center">
      <div className="flex gap-3">
        {steps.map((step) => (
          <Link
            key={step.id}
            to={step.path}
            className={`relative px-5 py-2 text-sm font-semibold rounded-md
              ${current === step.id
                ? "bg-indigo-700 text-white"
                : "bg-indigo-200 text-indigo-900"
              }`}
          >
            {step.label}

            {/* MEDIUM ARROW */}
            <span
              className={`absolute top-0 right-[-18px] w-0 h-0
                border-t-[18px] border-b-[18px] border-l-[18px]
                ${current === step.id
                  ? "border-l-indigo-700"
                  : "border-l-indigo-200"
                }
                border-t-transparent border-b-transparent`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
