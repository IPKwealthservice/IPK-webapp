import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSteps from "../components/HeaderSteps";
import SuitabilityGauge from "../components/SuitabilityGauge";
import { getSuitabilityScore } from "../../../../services/suitability.service";

export default function Suitability() {
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await getSuitabilityScore();
        setScore(res.score);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  }, []);

  if (loading) return <p>Loading suitability...</p>;

  return (
    <div className="mobile-padding tablet-padding desktop-padding">

      {/* ✅ HEADER STEPS */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={4} />
      </div>

      {/* ✅ SUITABILITY CONTENT */}
      <SuitabilityGauge score={score} />

      {/* ✅ NEXT BUTTON */}
      <div className="flex justify-end mt-10">
        <button
          onClick={() => navigate("/sales/onboarding/process/agreement")}
          className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Next
        </button>
      </div>

    </div>
  );

}
