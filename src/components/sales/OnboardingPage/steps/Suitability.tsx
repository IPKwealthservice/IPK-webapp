import { useEffect, useState } from "react";
import HeaderSteps from "../components/HeaderSteps";
import SuitabilityGauge from "../components/SuitabilityGauge";
import { getSuitabilityScore } from "../../../../services/suitability.service";

export default function Suitability() {
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
      <HeaderSteps current={5} />
    </div>

    {/* ✅ SUITABILITY CONTENT */}
    <SuitabilityGauge score={score} />

  </div>
);

}
