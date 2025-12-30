import { useState } from "react";
import HeaderSteps from "../components/HeaderSteps";
import { useNavigate } from "react-router-dom";

export default function Suitability() {
  const navigate = useNavigate();

  // 0 = Low, 50 = Medium, 100 = High
  const [riskValue, setRiskValue] = useState(50);

  const needleRotation = -90 + (riskValue * 180) / 100;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      {/* Header Steps – DO NOT CHANGE */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={4} />
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        Suitability Assessment
      </h2>

      <p className="text-gray-600 mb-8">
        Based on your answers, your risk profile is calculated below.
      </p>

      {/* ===== Risk Speedometer ===== */}
      <div className="flex flex-col items-center">
        <div className="relative w-80 h-40 overflow-hidden">
          {/* Gradient Arc */}
          <div
            className="absolute inset-0 rounded-t-full"
            style={{
              background:
                "conic-gradient(from 180deg, #22c55e 0deg, #eab308 90deg, #ef4444 180deg)",
            }}
          />

          {/* Inner White Cut */}
          <div className="absolute inset-4 bg-white rounded-t-full" />

          {/* Needle */}
          <div
            className="absolute left-1/2 bottom-0 w-1 h-28 bg-black origin-bottom transition-transform duration-500"
            style={{
              transform: `rotate(${needleRotation}deg) translateX(-50%)`,
            }}
          />

          {/* Needle Center */}
          <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-black rounded-full -translate-x-1/2" />

          {/* Labels */}
          <span className="absolute left-2 bottom-2 text-sm text-gray-500">
            CONSERVATIVE
          </span>
          <span className="absolute left-1/2 top-1 text-sm text-gray-500 -translate-x-1/2">
            MODERATE
          </span>
          <span className="absolute right-2 bottom-2 text-sm text-gray-500">
            AGRESSIVE
          </span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">RISK</p>
          <p className="text-sm text-gray-500 mt-1">
            {riskValue <= 33
              ? "Low Risk Investor"
              : riskValue <= 66
              ? "Moderate Risk Investor"
              : "High Risk Investor"}
          </p>
        </div>

        {/* Slider Control */}
        <div className="w-full max-w-md mt-6">
          <input
            type="range"
            min={0}
            max={100}
            value={riskValue}
            onChange={(e) => setRiskValue(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Navigation – DO NOT CHANGE */}
      <div className="flex justify-end mt-10">
        <button
          onClick={() =>
            navigate("/sales/onboarding/process/agreement")
          }
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}


