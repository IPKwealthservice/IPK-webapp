import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const steps = [
  { id: 1, label: "Client Profile", path: "/sales/onboarding/process/client-profile" },
  { id: 2, label: "Authentication", path: "/sales/onboarding/process/authentication" },
  { id: 3, label: "Questionaire", path: "/sales/onboarding/process/risk-type" },
  { id: 4, label: "Suitability", path: "/sales/onboarding/process/suitability" },
  { id: 5, label: "Agreement", path: "/sales/onboarding/process/agreement" },
  { id: 6, label: "E-Sign", path: "/sales/onboarding/process/e-sign" },
];

export default function HeaderSteps({ current }: { current: number }) {
  const location = useLocation();
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      const modalOpen = document.querySelector(
        ".fixed.inset-0.bg-black.bg-opacity-40"
      );
      setHideHeader(!!modalOpen);
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (hideHeader || location.pathname.includes("preview")) {
    return null;
  }

  return (
    <div className="mobile-padding tablet-padding desktop-padding">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">

          {/* ✅ FIXED MOBILE RESPONSIVE CONTAINER */}
          <div className="flex overflow-x-auto md:overflow-visible md:justify-center scrollbar-hide">
            <div className="flex items-center min-w-max gap-1 pl-3 pr-3 sm:pl-0 sm:pr-0">

              {steps.map((step) => {
                const isActive = current === step.id;
                const isCompleted = step.id < current;

                return (
                  <Link
                    key={step.id}
                    to={step.path}
                    className={`
                      relative flex items-center justify-center
                      h-9 sm:h-10 md:h-12
                      px-4 sm:px-6 md:px-8
                      text-xs sm:text-sm font-semibold
                      transition-all duration-300 select-none

                      ${isActive && "bg-indigo-700 text-white shadow-lg"}
                      ${isCompleted && "bg-indigo-500 text-white"}
                      ${
                        !isActive && !isCompleted &&
                        "bg-indigo-100 text-indigo-900"
                      }

                      hover:shadow-indigo-500/40 hover:shadow-xl
                    `}
                    style={{
                      clipPath:
                        "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)",
                    }}
                  >
                    <span className="whitespace-nowrap">
                      {step.label}
                    </span>
                  </Link>
                );
              })}

            </div>
          </div>

        </div>
      </div>
   // </div>
  );
}
