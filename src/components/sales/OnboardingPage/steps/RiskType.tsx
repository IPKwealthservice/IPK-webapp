import React, { useState } from "react";
import HeaderSteps from "../components/HeaderSteps";

/* ================= TYPES ================= */

type Question = {
  id: number;
  question: string;
  options: string[];
};

/* ================= QUESTIONS DATA (UNCHANGED) ================= */

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is your current net worth like?",
    options: [" 1–10 crores", "10–20 crores", "20–25 crores", "25 crores and above"],
  },
  {
    id: 2,
    question: "How much do you want to contribute each month?",
    options: [
      "Monthly Contribution / Initial Investment < 10%",
      "Monthly Contribution / Initial Investment >= 10%",
    ],
  },
  {
    id: 3,
    question: "What is the primary reason you are investing your funds?",
    options: [
      "Long-term capital growth",
      "To meet income needs",
      "Long-term capital growth and income",
      "For capital security",
    ],
  },
  {
    id: 4,
    question:
      "Which of the following best describes your current stage of life?",
    options: [
      "Making savings for future plans",
      "Saving to buy a home",
      "Saving for retirement",
      "Got immediate money for investing long term",
      "Regular savings investment",
    ],
  },
  {
    id: 5,
    question:
      "What would you estimate your net worth to be, that is total assests excluding the family, home after liabilities?",
    options: [
      "Below 1 crore",
      "1–5 crore",
      "5–10 crore",
      "10 crore and above",
    ],
  },
  {
    id: 6,
    question:
      "When will you need to start withdrawing funds from this account?",
    options: [" 1 year", "2–5 years", "5–10 years", "More than 10 years from now"],
  },
  {
    id: 7,
    question:
      "How would you characterize your willingness to accept investment risk in order to achieve your investment objectives?",
    options: ["Low", "Average", "High", "Below Average", "Above Average"],
  },
  {
    id: 8,
    question: "How familiar are you with investment matters?",
    options: [
      "Not familiar",
      "Very familiar when it comes to investments",
      "Somewhat familiar. I don't fully understand investments, including the share market",
      "Fairly familiar. I understand the various factors which influence investment performance",
    ],
  },
  {
    id: 9,
    question:
      "What is your level of reliance on the income generated from the portfolio to meet your needs?",
    options: [
      "Nil. I have other income sources",
      "Minimal. I have other income sources but the income from the portfolio does help",
      "Reasonable. I rely somewhat on the income generated from the prtfolio",
      "Considerable. I rely heavily on the income generated from the portfolio",
    ],
  },
  {
    id: 10,
    question:
      "When considering your investments and making investments decisions, do you think about the impact of possible losses or possible gains?",
    options: [
      "I am always concerned about possible losses",
      "I am somewhat concerned about possible losses",
      "I usually consider possible gains",
      "I always consider possible gains",
    ],
  },
];

/* ================= OPTION SCORE MAP ================= */

const OPTION_SCORES: Record<number, number[]> = {
  1: [1, 2, 3, 4],
  2: [1, 3],
  3: [4, 2, 3, 1],
  4: [1, 2, 3, 4, 3],
  5: [1, 2, 3, 4],
  6: [1, 2, 3, 4],
  7: [1, 3, 5, 2, 4],
  8: [1, 4, 2, 3],
  9: [4, 3, 2, 1],
  10: [1, 2, 3, 4],
};

/* ================= COMPONENT ================= */

export default function RiskType() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [riskValue, setRiskValue] = useState(50);
  const [riskLabel, setRiskLabel] = useState("");

  const handleSelect = (qid: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const handleContinue = () => {
    let totalScore = 0;

    QUESTIONS.forEach((q) => {
      const index = answers[q.id];
      if (index !== undefined) {
        totalScore += OPTION_SCORES[q.id][index];
      }
    });

    const percentage = Math.min(100, Math.round((totalScore / 40) * 100));
    setRiskValue(percentage);

    if (percentage <= 33) setRiskLabel("Conservative");
    else if (percentage <= 66) setRiskLabel("Moderate");
    else setRiskLabel("Aggressive");

    setShowResult(true);
  };

  const needleRotation = -90 + (riskValue * 180) / 100;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={showResult ? 4 : 3} />
      </div>

      {!showResult ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Risk Questionnaire
          </h2>

          {QUESTIONS.map((q) => (
            <div key={q.id} className="mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
                {q.id}. {q.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === idx;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(q.id, idx)}
                      className={`text-left px-4 py-2.5 rounded-full text-sm border transition-all
                        ${
                          selected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200"
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-8">
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Suitability Assessment
          </h2>

          <div className="relative w-80 h-40 mx-auto overflow-hidden">
            <div
              className="absolute inset-0 rounded-t-full"
              style={{
                background:
                  "conic-gradient(from 180deg, #22c55e 0deg, #eab308 90deg, #ef4444 180deg)",
              }}
            />
            <div className="absolute inset-4 bg-white rounded-t-full" />
            <div
              className="absolute left-1/2 bottom-0 w-1 h-28 bg-black origin-bottom transition-transform duration-500"
              style={{ transform: `rotate(${needleRotation}deg) translateX(-50%)` }}
            />
            <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-black rounded-full -translate-x-1/2" />
          </div>

          <p className="mt-6 text-lg font-semibold">{riskLabel} Investor</p>
        </div>
      )}
    </div>
  );
}
