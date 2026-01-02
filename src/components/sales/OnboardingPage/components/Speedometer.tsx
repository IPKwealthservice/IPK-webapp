import React from "react";

type SpeedometerProps = {
  riskValue: number; // 0 – 100
};

export default function Speedometer({ riskValue }: SpeedometerProps) {
  // Map 0–100 → -90° to +90°
  const needleAngle = -90 + (riskValue * 180) / 100;

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 420 240"
        className="w-[260px] sm:w-[320px] md:w-[380px]"
      >
        {/* ===== OUTER ARCS ===== */}

        {/* Conservative – Green */}
        <path
          d="M 60 200 A 150 150 0 0 1 170 70"
          fill="none"
          stroke="#6cc24a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Moderate – Yellow */}
        <path
          d="M 170 70 A 150 150 0 0 1 250 70"
          fill="none"
          stroke="#f2c94c"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Aggressive – Red */}
        <path
          d="M 250 70 A 150 150 0 0 1 360 200"
          fill="none"
          stroke="#eb5757"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* ===== INNER DASHED ARC ===== */}
        <path
          d="M 90 200 A 120 120 0 0 1 330 200"
          fill="none"
          stroke="#f2c94c"
          strokeWidth="3"
          strokeDasharray="6 6"
        />

        {/* ===== BASE LINE ===== */}
        <line
          x1="60"
          y1="200"
          x2="360"
          y2="200"
          stroke="#e5e7eb"
          strokeWidth="5"
        />

        {/* ===== NEEDLE ===== */}
        <g
          transform={`rotate(${needleAngle} 210 200)`}
          style={{ transition: "transform 0.6s ease" }}
        >
          <line
            x1="210"
            y1="200"
            x2="210"
            y2="95"
            stroke="#1f2937"
            strokeWidth="4"
          />
        </g>

        {/* Needle Center */}
        <circle cx="210" cy="200" r="8" fill="#1f2937" />

        {/* ===== LABELS ===== */}
        <text
          x="95"
          y="165"
          fontSize="13"
          fill="#2f855a"
          transform="rotate(-65 95 165)"
        >
          Conservative
        </text>

        <text
          x="200"
          y="40"
          fontSize="13"
          fill="#b7791f"
          textAnchor="middle"
        >
          Moderate
        </text>

        <text
          x="310"
          y="165"
          fontSize="13"
          fill="#c53030"
          transform="rotate(65 310 165)"
        >
          Aggressive
        </text>
      </svg>
    </div>
  );
}
