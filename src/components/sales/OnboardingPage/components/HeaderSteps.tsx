import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Client Profile", path: "/sales/onboarding/client-profile" },
  { id: 2, label: "Authentication", path: "/sales/onboarding/authentication" },
  { id: 3, label: "Questionnaire", path: "/sales/onboarding/risk-type" },
  { id: 4, label: "Suitability", path: "/sales/onboarding/suitability" },
  { id: 5, label: "Agreement", path: "/sales/onboarding/agreement" },
  { id: 6, label: "E-Sign", path: "/sales/onboarding/e-sign" },
];

export default function HeaderSteps({ current }: { current: number }) {
  return (
    <div className="mobile-padding tablet-padding desktop-padding">
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* ✅ Mobile scroll + Desktop center */}
        <div className="flex overflow-x-auto md:overflow-visible md:justify-center scrollbar-hide">
          <div className="flex items-center min-w-max gap-0">
            {steps.map((step, index) => {
              const isActive = current === step.id;
              const isCompleted = step.id < current;
              const isLast = index === steps.length - 1;

              return (
                <Link
  key={step.id}
  to={step.path}
  className={`
    relative h-12 px-8 flex items-center text-sm font-semibold
    transition-all duration-300 select-none
    ${isActive ? "bg-indigo-700 text-white shadow-lg" : ""}
    ${isCompleted ? "bg-indigo-500 text-white" : ""}
    ${
      !isActive && !isCompleted
        ? "bg-indigo-100 text-indigo-900"
        : ""
    }
    hover:shadow-indigo-500/40 hover:shadow-xl
    hover:scale-[1.02]
  `}
  style={{
    clipPath:
      "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)",
  }}
>
  <span className="whitespace-nowrap">{step.label}</span>
</Link>

              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
