import "./SuitabilityGauge.css";

export default function SuitabilityGauge({ score = 55 }) {
  const angle = (score / 100) * 180 - 90;

  const getLabel = () => {
    if (score < 35) return "Conservative Investor";
    if (score < 70) return "Moderate Investor";
    return "Aggressive Investor";
  };

  return (
    <div className="gauge-wrapper">
      <h2>Suitability Assessment</h2>

      <div className="gauge">
        <svg viewBox="0 0 200 100" className="gauge-svg">
          {/* Arc */}
          <path
            d="M10 100 A90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="12"
          />

          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            className="needle"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "100px 100px",
            }}
          />

          {/* Center dot */}
          <circle cx="100" cy="100" r="4" fill="#000" />

          <defs>
            <linearGradient id="grad">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <p className="label">{getLabel()}</p>
    </div>
  );
}
