import { Link, useLocation } from "react-router-dom";

const steps = [
  { label: "Client Profile", path: "/sales/onboarding/client-profile" },
  { label: "Authentication", path: "/sales/onboarding/authentication" },
  { label: "Risk Type", path: "/sales/onboarding/risk-type" },
  { label: "Suitability", path: "/sales/onboarding/suitability" },
  { label: "Agreement", path: "/sales/onboarding/agreement" },
  { label: "E-Sign", path: "/sales/onboarding/e-sign" },
];

export default function OnboardingHeader() {
  const location = useLocation();

  return (
    <div className="flex gap-2 my-6">
      {steps.map((s, i) => {
        const active = location.pathname === s.path;

        return (
          <Link
            key={i}
            to={s.path}
            className={`px-6 py-3 text-sm font-medium text-white rounded-r-lg 
              ${active ? "bg-indigo-900" : "bg-indigo-400 hover:bg-indigo-500"}
            `}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
